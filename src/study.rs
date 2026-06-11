//! Rational observation study.
//!
//! Ingests `(vector, scalar)` observation pairs (originally from the
//! booLang-hardening studies) and analyzes them through byteme's lens.
//! Each vector `[a, b]` is a density observation — `a` hits out of `b`
//! positions — i.e. the compressed form of a binary string's
//! ones/length summary. byteme computes the theoretical Bernoulli
//! entropy of that density without materializing `b` bits.
//!
//! ## Why v2: identity must hold across dimensions
//!
//! The v1 form put a float in the identity record (the scalar via
//! shortest-roundtrip, the density implicitly). Across dimensions —
//! values spanning `0.1` to `-1977345647`, ratios at wildly different
//! scales — a float "does not keep its value": `0.1_f64` is not exactly
//! one tenth, and identity computed on it is fragile. v2 makes the
//! identity **exact and dimension-invariant**:
//!
//! - the vector `[a, b]` is reduced to lowest terms (`crate::rational`),
//!   so `[25, 3319]` and `[50, 6638]` share ONE identity — scale is no
//!   longer part of it;
//! - the scalar is parsed from its exact decimal string into a
//!   `Rational`, so no float ever touches the BLID record.
//!
//! Canonical record form (v2), integer-only, reproducible byte-for-byte
//! in any language:
//! ```text
//! entry: study-entry/v2\n<ratio.canonical()> <scalar.canonical()>
//! run:   study-run/v2\n<entry-blid-full>\n…one line per entry…
//! ```
//! Display fields (`density`, `entropy`, `weighted`) remain `f64` — they
//! are for human eyes only and never enter the identity.

use crate::blid::Blid;
use crate::rational::Rational;

/// The study set, embedded verbatim. 32 vectors, 32 scalars (as exact
/// decimal strings — NOT f64 literals, so the value survives), aligned.
pub const STUDY_VECTORS: [(u64, u64); 32] = [
    (25, 3319),
    (51, 53),
    (1, 53),
    (2, 597),
    (105, 349),
    (152, 497),
    (172, 2403),
    (183, 677),
    (262, 473),
    (461, 1373),
    (706, 1033),
    (1012, 1809),
    (1270, 4491),
    (1347, 1387),
    (1356, 3097),
    (1611, 1681),
    (1697, 3431),
    (2078, 2961),
    (2806, 2883),
    (3443, 5463),
    (3497, 6117),
    (3925, 4809),
    (7076, 7257),
    (168091, 250000),
    (83, 353),
    (63, 100),
    (590, 1921),
    (3915, 9229),
    (7881, 86801),
    (937087, 1096491),
    (46423, 63041),
    (164674, 323067),
];

pub const STUDY_SCALARS: [&str; 32] = [
    "-1977345647",
    "-1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "1",
    "0.1",
    "0.7",
    "0.8",
    "0.9113",
    "0.94",
    "3",
    "5.822",
    "128",
];

#[derive(Debug, Clone, PartialEq)]
pub struct StudyEntry {
    pub index: usize,
    pub a: u64,
    pub b: u64,
    /// Exact reduced ratio a/b — the dimension-invariant identity.
    pub ratio: Rational,
    /// Exact scalar (parsed from its decimal string).
    pub scalar: Rational,
    /// a / b as f64 — DISPLAY ONLY.
    pub density: f64,
    /// Bernoulli entropy of the density, bits — DISPLAY ONLY.
    pub entropy: f64,
    /// entropy × scalar — DISPLAY ONLY.
    pub weighted: f64,
    pub blid_short: String,
    pub blid_full: String,
}

#[derive(Debug, Clone, PartialEq)]
pub struct StudyRun {
    pub entries: Vec<StudyEntry>,
    pub run_blid_short: String,
    pub run_blid_full: String,
}

impl StudyRun {
    /// Canonical run record: one entry-BLID per line under the v2 header.
    pub fn run_record(&self) -> String {
        let mut rec = String::from("study-run/v2\n");
        for e in &self.entries {
            rec.push_str(&e.blid_full);
            rec.push('\n');
        }
        rec
    }

    /// Keyed (HMAC) run BLID: converges for key-holders, reveals nothing
    /// to anyone else.
    pub fn keyed_run_blid(&self, key: &str) -> Blid {
        Blid::keyed_of_record(key, &self.run_record())
    }
}

/// Bernoulli entropy of probability `p`, in bits. Total: 0.0 outside
/// (0,1) instead of NaN.
pub fn bernoulli_entropy(p: f64) -> f64 {
    if p <= 0.0 || p >= 1.0 {
        return 0.0;
    }
    let q = 1.0 - p;
    -(p * p.log2() + q * q.log2())
}

/// Analyze one observation. `None` if malformed (`b == 0`, `a > b`, or a
/// scalar that is not an exact decimal) — bad rows are surfaced, never
/// silently absorbed.
pub fn analyze_entry(index: usize, a: u64, b: u64, scalar: &str) -> Option<StudyEntry> {
    if b == 0 || a > b {
        return None;
    }
    let ratio = Rational::new(a as i128, b as i128)?;
    let scalar_r = Rational::from_decimal_str(scalar)?;
    let density = a as f64 / b as f64;
    let entropy = bernoulli_entropy(density);
    // Identity record is integer-only — exact, dimension-invariant.
    let record = format!(
        "study-entry/v2\n{} {}",
        ratio.canonical(),
        scalar_r.canonical()
    );
    let blid = Blid::of_record(&record);
    Some(StudyEntry {
        index,
        a,
        b,
        ratio,
        scalar: scalar_r,
        density,
        entropy,
        weighted: entropy * scalar_r.to_f64(),
        blid_short: blid.short().to_string(),
        blid_full: blid.full().to_string(),
    })
}

/// Analyze a full `(vectors, scalars)` import. Errors on length mismatch
/// or any malformed row.
pub fn analyze_run(vectors: &[(u64, u64)], scalars: &[&str]) -> Result<StudyRun, String> {
    if vectors.len() != scalars.len() {
        return Err(format!(
            "vector/scalar length mismatch: {} vectors vs {} scalars",
            vectors.len(),
            scalars.len()
        ));
    }
    let mut entries = Vec::with_capacity(vectors.len());
    for (i, (&(a, b), &s)) in vectors.iter().zip(scalars.iter()).enumerate() {
        match analyze_entry(i, a, b, s) {
            Some(e) => entries.push(e),
            None => {
                return Err(format!(
                    "malformed entry {}: [{}, {}] scalar {:?}",
                    i, a, b, s
                ))
            }
        }
    }
    let mut run_record = String::from("study-run/v2\n");
    for e in &entries {
        run_record.push_str(&e.blid_full);
        run_record.push('\n');
    }
    let run_blid = Blid::of_record(&run_record);
    Ok(StudyRun {
        entries,
        run_blid_short: run_blid.short().to_string(),
        run_blid_full: run_blid.full().to_string(),
    })
}

/// The embedded study.
pub fn study_run() -> StudyRun {
    analyze_run(&STUDY_VECTORS, &STUDY_SCALARS)
        .expect("embedded study set is statically well-formed")
}

/// The v1 run BLID, preserved as a historical constant. v1 put a float in
/// the record; v2 replaced it with exact rationals. Kept so the earlier
/// booLang-hardening handshake value remains documented and greppable.
pub const V1_RUN_BLID_SHORT: &str = "55669eccbbfc4cfa";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn study_set_is_index_aligned() {
        assert_eq!(STUDY_VECTORS.len(), 32);
        assert_eq!(STUDY_SCALARS.len(), 32);
    }

    #[test]
    fn study_run_succeeds_with_all_entries() {
        assert_eq!(study_run().entries.len(), 32);
    }

    #[test]
    fn identity_is_dimension_invariant() {
        // THE fix: scaling the vector does not change the entry identity.
        // [25,3319] and [50,6638] are the same ratio → same BLID.
        let a = analyze_entry(0, 25, 3319, "1").unwrap();
        let b = analyze_entry(0, 50, 6638, "1").unwrap();
        assert_eq!(a.blid_full, b.blid_full, "scale leaked into identity");
        assert_eq!(a.ratio, b.ratio);
    }

    #[test]
    fn scalar_value_survives_translation() {
        // 0.1 as an exact rational is 1/10 — not the lossy 0.1_f64.
        let e = analyze_entry(0, 1, 2, "0.1").unwrap();
        assert_eq!(e.scalar.canonical(), "1/10");
        // "0.10" and "0.1" are the same exact value → same identity.
        let e2 = analyze_entry(0, 1, 2, "0.10").unwrap();
        assert_eq!(e.blid_full, e2.blid_full);
    }

    #[test]
    fn entropy_math_on_known_pairs() {
        // [63,100]: p=0.63 → H≈0.9505 bits.
        let e = analyze_entry(25, 63, 100, "0.7").unwrap();
        assert!((e.density - 0.63).abs() < 1e-12);
        assert!((e.entropy - 0.9505).abs() < 5e-4, "entropy {}", e.entropy);
    }

    #[test]
    fn malformed_rows_are_rejected() {
        assert!(analyze_entry(0, 5, 0, "1").is_none()); // b == 0
        assert!(analyze_entry(0, 10, 5, "1").is_none()); // a > b
        assert!(analyze_entry(0, 1, 2, "0x8").is_none()); // bad scalar
        assert!(analyze_run(&[(1, 2)], &["1", "2"]).is_err()); // length
    }

    #[test]
    fn run_blid_is_deterministic_across_imports() {
        let r1 = study_run();
        let r2 = analyze_run(&STUDY_VECTORS, &STUDY_SCALARS).unwrap();
        assert_eq!(r1.run_blid_full, r2.run_blid_full);
    }

    #[test]
    fn entry_blids_unique_within_study() {
        let run = study_run();
        let mut seen = std::collections::BTreeSet::new();
        for e in &run.entries {
            assert!(seen.insert(e.blid_full.clone()), "dup at {}", e.index);
        }
    }

    #[test]
    fn close_scalars_have_distinct_identity() {
        let a = analyze_entry(0, 1, 2, "0.9113").unwrap();
        let b = analyze_entry(0, 1, 2, "0.9114").unwrap();
        assert_ne!(a.blid_full, b.blid_full);
    }
}
