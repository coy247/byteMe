//! Universal input ingestion with exact canonical encoding.
//!
//! byteme accepts any input — bit strings, integers, power formulas,
//! arrays, text — and canonicalizes each kind deterministically so the
//! BLID of a value is always the same, whatever route it arrived by.
//!
//! **Parsing precedence (the zero-and-one guarantee).** A string of pure
//! `0`/`1` (whitespace allowed) is ALWAYS a bit string — it is never
//! reinterpreted as a number. `byteme 0` is the bit zero, `byteme 10` is
//! two bits, exactly as before. Only inputs that are not bit strings are
//! considered as arrays, power formulas, integers, then text:
//!
//! 1. pure 0/1 → `Bits`
//! 2. `[a, b, …]` integers in brackets → `Array`
//! 3. `2^n`, `2^n+2^m`, `2^n-2^m` → evaluated exactly → `Int`
//! 4. optional-sign decimal integer → `Int` (i128 range)
//! 5. anything else → `Text` (UTF-8 → bits, as before)
//!
//! **Exactness.** Integers canonicalize by their decimal value, so every
//! formula route to the same number converges on one BLID:
//! `8` ≡ `2^2+2^2` ≡ `2^4-2^3`. Arrays preserve element boundaries
//! (`[1,0]` ≠ `[10]`). Kinds are domain-separated: the *number* 8 is not
//! the *bit string* `1000` — different content, different BLID.
//!
//! **NAF decomposition.** Every integer is also reported in Non-Adjacent
//! Form — the unique signed-power form Σ±2^k with no two adjacent
//! nonzero digits. Subtraction appears exactly where it is needed
//! (runs of ones): `7 = +2^3 −2^0`, not `4+2+1`. This is the canonical
//! "2^n ± 2^m" view, generalized.
//!
//! Delimited: i128 bounds the integer range (±~1.7e38); out-of-range
//! digit strings are an input error, not a silent fallback. The signed
//! zero of the bipolar walk does not exist here — the integer 0 is one
//! value with one BLID (math exactness wins over the no-zero aesthetic).

use crate::blid::Blid;
use crate::encode;

#[derive(Debug, Clone, PartialEq)]
pub enum Ingested {
    /// Raw bit string (possibly whitespace-stripped).
    Bits { bits: String },
    /// An exact integer, with its NAF decomposition (sign, power).
    Int {
        value: i128,
        bits: String,
        naf: Vec<(i8, u32)>,
    },
    /// A flat array of exact integers.
    Array { values: Vec<i128>, bits: String },
    /// Text, UTF-8-encoded to bits (the legacy path).
    Text { text: String, bits: String },
}

#[derive(Debug, Clone, PartialEq)]
pub enum IngestError {
    /// Integer literal exceeded the i128 range.
    IntOutOfRange(String),
    /// Bracketed input that doesn't parse as an integer array.
    MalformedArray(String),
    /// Input produced no bits at all (e.g. empty string).
    Empty,
}

impl std::fmt::Display for IngestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            IngestError::IntOutOfRange(s) => {
                write!(f, "integer out of i128 range: {}", s)
            }
            IngestError::MalformedArray(s) => write!(f, "malformed array: {}", s),
            IngestError::Empty => write!(f, "empty input"),
        }
    }
}

/// Non-Adjacent Form: the unique representation v = Σ dᵢ·2^kᵢ with
/// dᵢ ∈ {−1, +1} and no two adjacent powers. Subtraction shows up
/// exactly where runs of ones make it shorter.
///
/// Total over ALL of i128, including MAX and MIN: the digit arithmetic
/// runs over the u128 magnitude (one headroom bit, so the +1 step at
/// 2^127−1 cannot overflow) and the sign is applied to the digits —
/// NAF(−v) is exactly NAF(v) with every digit negated. A naive signed
/// implementation panics at i128::MAX (`v -= −1` overflows); this was
/// found by extreme-value testing, not by inspection.
pub fn naf(value: i128) -> Vec<(i8, u32)> {
    let sign: i8 = if value < 0 { -1 } else { 1 };
    let mut v: u128 = value.unsigned_abs();
    let mut out = Vec::new();
    let mut k = 0u32;
    while v != 0 {
        if v & 1 == 1 {
            // v mod 4 == 1 → digit +1 ; v mod 4 == 3 → digit −1
            let d: i8 = if v & 3 == 1 { 1 } else { -1 };
            out.push((d * sign, k));
            if d > 0 {
                v -= 1;
            } else {
                v += 1; // magnitude ≤ 2^127 < u128::MAX — cannot overflow
            }
        }
        v >>= 1;
        k += 1;
    }
    out
}

/// Render a NAF decomposition as a formula: `+2^3 −2^0`.
pub fn naf_formula(naf: &[(i8, u32)]) -> String {
    if naf.is_empty() {
        return "0".to_string();
    }
    naf.iter()
        .rev()
        .map(|&(d, k)| format!("{}2^{}", if d > 0 { "+" } else { "−" }, k))
        .collect::<Vec<_>>()
        .join(" ")
}

/// Minimal binary representation of |v| ("0" for v == 0).
fn magnitude_bits(v: i128) -> String {
    let m = v.unsigned_abs();
    if m == 0 {
        "0".to_string()
    } else {
        format!("{:b}", m)
    }
}

fn try_power_expr(s: &str) -> Option<i128> {
    // Accepts 2^n, 2^n+2^m, 2^n-2^m (ASCII − also tolerated).
    let s: String = s.chars().filter(|c| !c.is_whitespace()).collect();
    let s = s.replace('−', "-");
    let rest = s.strip_prefix("2^")?;
    let (n_str, op_m) = match (rest.find('+'), rest.find('-')) {
        (Some(i), _) => (&rest[..i], Some(('+', &rest[i + 1..]))),
        (None, Some(i)) => (&rest[..i], Some(('-', &rest[i + 1..]))),
        (None, None) => (rest, None),
    };
    let n: u32 = n_str.parse().ok()?;
    if n >= 127 {
        return None; // would overflow i128
    }
    let base = 1i128 << n;
    match op_m {
        None => Some(base),
        Some((op, m_part)) => {
            let m_str = m_part.strip_prefix("2^")?;
            let m: u32 = m_str.parse().ok()?;
            if m >= 127 {
                return None;
            }
            let term = 1i128 << m;
            Some(if op == '+' { base + term } else { base - term })
        }
    }
}

fn try_array(s: &str) -> Option<Result<Vec<i128>, IngestError>> {
    let t = s.trim();
    if !t.starts_with('[') || !t.ends_with(']') {
        return None;
    }
    let inner = &t[1..t.len() - 1];
    if inner.trim().is_empty() {
        return Some(Ok(Vec::new()));
    }
    let mut values = Vec::new();
    for part in inner.split(',') {
        match part.trim().parse::<i128>() {
            Ok(v) => values.push(v),
            Err(_) => return Some(Err(IngestError::MalformedArray(s.to_string()))),
        }
    }
    Some(Ok(values))
}

fn looks_like_int(s: &str) -> bool {
    let t = s.trim();
    let body = t.strip_prefix('-').unwrap_or(t);
    !body.is_empty() && body.chars().all(|c| c.is_ascii_digit())
}

/// Ingest any input under the documented precedence.
pub fn ingest(input: &str) -> Result<Ingested, IngestError> {
    if input.is_empty() {
        return Err(IngestError::Empty);
    }

    // 1. The zero-and-one guarantee: pure bits stay bits.
    let stripped: String = input.chars().filter(|c| !c.is_whitespace()).collect();
    if !stripped.is_empty() && stripped.bytes().all(|b| b == b'0' || b == b'1') {
        return Ok(Ingested::Bits { bits: stripped });
    }

    // 2. Arrays.
    if let Some(parsed) = try_array(input) {
        let values = parsed?;
        let bits: String = values.iter().map(|&v| magnitude_bits(v)).collect();
        return Ok(Ingested::Array { values, bits });
    }

    // 3. Power formulas: 2^n ± 2^m.
    if let Some(value) = try_power_expr(input) {
        return Ok(Ingested::Int {
            value,
            bits: magnitude_bits(value),
            naf: naf(value),
        });
    }

    // 4. Plain integers — out-of-range is an error, not a silent fallback.
    if looks_like_int(input) {
        return match input.trim().parse::<i128>() {
            Ok(value) => Ok(Ingested::Int {
                value,
                bits: magnitude_bits(value),
                naf: naf(value),
            }),
            Err(_) => Err(IngestError::IntOutOfRange(input.trim().to_string())),
        };
    }

    // 5. Text (legacy path).
    Ok(Ingested::Text {
        text: input.to_string(),
        bits: encode::to_binary(input),
    })
}

impl Ingested {
    /// The bits the analysis pipeline runs on.
    pub fn bits(&self) -> &str {
        match self {
            Ingested::Bits { bits }
            | Ingested::Int { bits, .. }
            | Ingested::Array { bits, .. }
            | Ingested::Text { bits, .. } => bits,
        }
    }

    /// Human-readable kind tag.
    pub fn kind(&self) -> &'static str {
        match self {
            Ingested::Bits { .. } => "bits",
            Ingested::Int { .. } => "int",
            Ingested::Array { .. } => "array",
            Ingested::Text { .. } => "text",
        }
    }

    /// The content-addressed identifier of this input, domain-separated
    /// by kind. Ints canonicalize by decimal value (all formula routes
    /// converge); arrays preserve element boundaries; bits and text keep
    /// the historical bit-level BLID (pinned vectors stay valid).
    pub fn blid(&self) -> Blid {
        match self {
            Ingested::Bits { bits } => Blid::of_binary(bits),
            Ingested::Text { bits, .. } => Blid::of_binary(bits),
            Ingested::Int { value, .. } => Blid::of_record(&format!("int/v1\n{}", value)),
            Ingested::Array { values, .. } => Blid::of_record(&Self::array_record(values)),
        }
    }

    /// Keyed (HMAC) variant of [`Self::blid`]: same canonical records,
    /// but the resulting ID reveals nothing without the key. Use for
    /// content that must stay private even if the BLID is discovered.
    pub fn blid_keyed(&self, key: &str) -> Blid {
        match self {
            Ingested::Bits { bits } => Blid::keyed_of_binary(key, bits),
            Ingested::Text { bits, .. } => Blid::keyed_of_binary(key, bits),
            Ingested::Int { value, .. } => {
                Blid::keyed_of_record(key, &format!("int/v1\n{}", value))
            }
            Ingested::Array { values, .. } => {
                Blid::keyed_of_record(key, &Self::array_record(values))
            }
        }
    }

    fn array_record(values: &[i128]) -> String {
        let mut rec = format!("array/v1\n{}\n", values.len());
        for v in values {
            rec.push_str(&format!("{}\n", v));
        }
        rec
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ---- the zero-and-one guarantee ----

    #[test]
    fn zero_and_one_stay_bits() {
        assert!(matches!(ingest("0").unwrap(), Ingested::Bits { .. }));
        assert!(matches!(ingest("1").unwrap(), Ingested::Bits { .. }));
        assert!(matches!(ingest("10").unwrap(), Ingested::Bits { .. }));
        assert!(matches!(
            ingest("0101 1010").unwrap(),
            Ingested::Bits { .. }
        ));
    }

    #[test]
    fn bit_string_blid_unchanged_from_v1() {
        // Backward compatibility: the Bits path must keep producing the
        // historical byteme/blid/v1 value.
        let i = ingest("0100100001101001").unwrap();
        assert_eq!(i.blid().short(), "a2fc4a037c913df5");
    }

    // ---- integers and the formula of eight ----

    #[test]
    fn eight_collectively_three_routes_one_blid() {
        let plain = ingest("8").unwrap();
        let split = ingest("2^2+2^2").unwrap();
        let signed = ingest("2^4-2^3").unwrap();
        assert_eq!(plain.blid(), split.blid());
        assert_eq!(plain.blid(), signed.blid());
        match plain {
            Ingested::Int {
                value, ref bits, ..
            } => {
                assert_eq!(value, 8);
                assert_eq!(bits, "1000");
            }
            _ => panic!("8 must ingest as Int"),
        }
    }

    #[test]
    fn the_number_eight_is_not_the_bit_string_1000() {
        // Domain separation: same bits, different content kind.
        let int8 = ingest("8").unwrap();
        let bits = ingest("1000").unwrap();
        assert_eq!(int8.bits(), bits.bits());
        assert_ne!(int8.blid(), bits.blid());
    }

    #[test]
    fn naf_of_eight_is_single_power() {
        assert_eq!(naf(8), vec![(1, 3)]);
        assert_eq!(naf_formula(&naf(8)), "+2^3");
    }

    #[test]
    fn naf_uses_subtraction_where_needed() {
        // 7 = 0111₂ — a run of ones. NAF: +2^3 −2^0, exactly the
        // "se puede restar en ciertos casos" observation.
        assert_eq!(naf(7), vec![(-1, 0), (1, 3)]);
        assert_eq!(naf_formula(&naf(7)), "+2^3 −2^0");
    }

    #[test]
    fn naf_handles_negatives_and_zero() {
        assert_eq!(naf(0), vec![]);
        assert_eq!(naf_formula(&naf(0)), "0");
        assert_eq!(naf(-1), vec![(-1, 0)]);
        let v: i128 = -7;
        let total: i128 = naf(v).iter().map(|&(d, k)| (d as i128) << k).sum();
        assert_eq!(total, v);
    }

    #[test]
    fn power_expr_unicode_minus_tolerated() {
        let a = ingest("2^4−2^3").unwrap(); // U+2212
        let b = ingest("2^4-2^3").unwrap();
        assert_eq!(a.blid(), b.blid());
    }

    #[test]
    fn negative_integers_ingest_exactly() {
        match ingest("-5").unwrap() {
            Ingested::Int {
                value, ref bits, ..
            } => {
                assert_eq!(value, -5);
                assert_eq!(bits, "101"); // magnitude bits; sign in record
            }
            _ => panic!("-5 must ingest as Int"),
        }
        assert_ne!(ingest("-5").unwrap().blid(), ingest("5").unwrap().blid());
    }

    #[test]
    fn out_of_range_int_is_an_error_not_text() {
        let huge = "9".repeat(60); // > i128::MAX
        assert!(matches!(ingest(&huge), Err(IngestError::IntOutOfRange(_))));
    }

    // ---- arrays ----

    #[test]
    fn loop_vector_ingests_as_array() {
        match ingest("[25, 3319]").unwrap() {
            Ingested::Array { ref values, .. } => assert_eq!(values, &vec![25, 3319]),
            _ => panic!("must be array"),
        }
    }

    #[test]
    fn array_boundaries_matter() {
        // [1,0] and [10] flatten to the same bits ("1" + "0" vs "1010"…
        // actually "10" vs "1010") but must have different BLIDs.
        let a = ingest("[1, 0]").unwrap();
        let b = ingest("[10]").unwrap();
        assert_ne!(a.blid(), b.blid());
    }

    #[test]
    fn malformed_array_is_an_error() {
        assert!(matches!(
            ingest("[1, dos]"),
            Err(IngestError::MalformedArray(_))
        ));
    }

    #[test]
    fn empty_array_is_valid_and_addressable() {
        let a = ingest("[]").unwrap();
        assert!(matches!(a, Ingested::Array { ref values, .. } if values.is_empty()));
    }

    // ---- text fallback ----

    #[test]
    fn text_path_unchanged() {
        match ingest("Hi").unwrap() {
            Ingested::Text { ref bits, .. } => assert_eq!(bits, "0100100001101001"),
            _ => panic!("Hi must remain text"),
        }
    }

    #[test]
    fn empty_input_is_an_error() {
        assert!(matches!(ingest(""), Err(IngestError::Empty)));
    }

    // ---- NAF properties (deterministic harness, seed cited) ----

    #[test]
    fn prop_naf_is_exact_and_non_adjacent() {
        let mut state: u64 = 0xB17E_5EED;
        for _ in 0..1_000 {
            state = state
                .wrapping_mul(6364136223846793005)
                .wrapping_add(1442695040888963407);
            let v = state as i64 as i128; // full signed range walk
            let d = naf(v);
            // exactness: evaluates back to v
            let total: i128 = d.iter().map(|&(s, k)| (s as i128) << k).sum();
            assert_eq!(total, v, "NAF not exact for {}", v);
            // digits are ±1 and powers strictly increasing, non-adjacent
            for w in d.windows(2) {
                assert!(w[1].1 >= w[0].1 + 2, "adjacent NAF digits for {}", v);
            }
            for &(s, _) in &d {
                assert!(s == 1 || s == -1);
            }
        }
    }
}
