//! Exact rational arithmetic — the dimension-invariant identity layer.
//!
//! The problem this solves: a ratio like `a/b` represented as an `f64`
//! "does not keep its value" across translation (`0.1` is not exactly
//! representable; shortest-roundtrip formatting can differ between
//! languages). That float is an *escape from the dimension where
//! identity is preserved*. The fix is to never let the identity touch a
//! float: reduce every ratio to lowest terms (via gcd) and carry exact
//! integer numerator/denominator.
//!
//! Two consequences, both load-bearing:
//! - **Dimension invariance.** `25/3319` and `50/6638` reduce to the
//!   same `Rational`, so they share one identity (one BLID). Scale is no
//!   longer part of the identity — only the ratio is.
//! - **Universal normalization.** To put a *set* of rationals over a
//!   common basis, use the LCM (MCM) of their denominators — and only
//!   where the denominators actually differ ("solo donde necesario").

/// Greatest common divisor (Euclid), on the magnitudes. gcd(0,0)=0.
pub fn gcd(a: i128, b: i128) -> i128 {
    let (mut a, mut b) = (a.unsigned_abs(), b.unsigned_abs());
    while b != 0 {
        let t = b;
        b = a % b;
        a = t;
    }
    a as i128
}

/// Least common multiple (MCM). lcm(x,0)=0. Saturates on overflow rather
/// than wrapping — an LCM that overflowed i128 is reported as a hard
/// error by callers, never a silently wrong small number.
pub fn lcm(a: i128, b: i128) -> Option<i128> {
    if a == 0 || b == 0 {
        return Some(0);
    }
    let g = gcd(a, b);
    (a / g).checked_mul(b).map(|v| v.abs())
}

/// An exact rational in lowest terms with a non-negative denominator.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Rational {
    num: i128,
    den: i128,
}

impl Rational {
    /// Build from integers, reducing to lowest terms. Sign is carried on
    /// the numerator; the denominator is always positive. den == 0 is
    /// rejected (returns None).
    pub fn new(num: i128, den: i128) -> Option<Self> {
        if den == 0 {
            return None;
        }
        let g = gcd(num, den);
        let g = if g == 0 { 1 } else { g };
        let (mut n, mut d) = (num / g, den / g);
        if d < 0 {
            n = -n;
            d = -d;
        }
        Some(Rational { num: n, den: d })
    }

    pub fn num(&self) -> i128 {
        self.num
    }
    pub fn den(&self) -> i128 {
        self.den
    }

    /// Approximate value as f64 — for DISPLAY only, never for identity.
    pub fn to_f64(&self) -> f64 {
        self.num as f64 / self.den as f64
    }

    /// Parse an exact decimal string ("0.9113", "-1977345647", "5.822")
    /// into an exact rational. No float ever touches the value: the
    /// fractional digits become the denominator power of ten. This is
    /// what keeps the value across translation.
    pub fn from_decimal_str(s: &str) -> Option<Self> {
        let s = s.trim();
        let (neg, body) = match s.strip_prefix('-') {
            Some(rest) => (true, rest),
            None => (false, s.strip_prefix('+').unwrap_or(s)),
        };
        if body.is_empty() {
            return None;
        }
        let (int_part, frac_part) = match body.split_once('.') {
            Some((i, f)) => (i, f),
            None => (body, ""),
        };
        if int_part.is_empty() && frac_part.is_empty() {
            return None;
        }
        if !int_part.chars().all(|c| c.is_ascii_digit())
            || !frac_part.chars().all(|c| c.is_ascii_digit())
        {
            return None;
        }
        let digits = format!("{}{}", int_part, frac_part);
        let num: i128 = digits.parse().ok()?;
        let den: i128 = 10i128.checked_pow(frac_part.len() as u32)?;
        Self::new(if neg { -num } else { num }, den)
    }

    /// Canonical string form for BLID records: `num/den`, always lowest
    /// terms, denominator positive. Integer-only — no float, so any
    /// language reproduces the exact bytes.
    pub fn canonical(&self) -> String {
        format!("{}/{}", self.num, self.den)
    }
}

/// Put a set of rationals over their common LCM denominator — but only
/// touch the entries whose denominator differs from the common one
/// ("solo donde necesario"). Returns the common denominator and the
/// rescaled numerators, or None if the LCM overflows i128.
pub fn over_common_denominator(rs: &[Rational]) -> Option<(i128, Vec<i128>)> {
    if rs.is_empty() {
        return Some((1, Vec::new()));
    }
    let mut common = rs[0].den;
    for r in &rs[1..] {
        common = lcm(common, r.den)?;
    }
    let nums = rs
        .iter()
        .map(|r| {
            if r.den == common {
                r.num // already on the common basis — untouched
            } else {
                r.num * (common / r.den)
            }
        })
        .collect();
    Some((common, nums))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gcd_basics() {
        assert_eq!(gcd(12, 18), 6);
        assert_eq!(gcd(25, 3319), 1);
        assert_eq!(gcd(0, 5), 5);
        assert_eq!(gcd(-12, 18), 6);
        assert_eq!(gcd(0, 0), 0);
    }

    #[test]
    fn lcm_basics() {
        assert_eq!(lcm(4, 6), Some(12));
        assert_eq!(lcm(3319, 6638), Some(6638));
        assert_eq!(lcm(7, 0), Some(0));
        assert_eq!(lcm(i128::MAX, i128::MAX - 1), None); // overflow → None
    }

    #[test]
    fn reduction_makes_scale_irrelevant() {
        // THE identity property: 25/3319 and 50/6638 are the same.
        let a = Rational::new(25, 3319).unwrap();
        let b = Rational::new(50, 6638).unwrap();
        assert_eq!(a, b);
        assert_eq!(a.canonical(), "25/3319");
        assert_eq!(b.canonical(), "25/3319");
    }

    #[test]
    fn sign_lives_on_numerator() {
        let r = Rational::new(1, -2).unwrap();
        assert_eq!(r.num(), -1);
        assert_eq!(r.den(), 2);
        assert_eq!(r.canonical(), "-1/2");
    }

    #[test]
    fn zero_denominator_rejected() {
        assert!(Rational::new(5, 0).is_none());
    }

    #[test]
    fn decimal_parsing_is_exact() {
        assert_eq!(
            Rational::from_decimal_str("0.1").unwrap().canonical(),
            "1/10"
        );
        assert_eq!(
            Rational::from_decimal_str("0.9113").unwrap().canonical(),
            "9113/10000"
        );
        assert_eq!(
            Rational::from_decimal_str("5.822").unwrap().canonical(),
            "2911/500"
        );
        assert_eq!(
            Rational::from_decimal_str("128").unwrap().canonical(),
            "128/1"
        );
        assert_eq!(
            Rational::from_decimal_str("-1977345647")
                .unwrap()
                .canonical(),
            "-1977345647/1"
        );
        // The classic float trap, defeated: "0.1" is exactly 1/10 here,
        // whereas 0.1_f64 is 0.1000000000000000055511151231257827021...
        assert_ne!(0.1_f64, 1.0 / 10.0 + f64::EPSILON);
        assert_eq!(
            Rational::from_decimal_str("0.10").unwrap().canonical(),
            "1/10"
        );
    }

    #[test]
    fn decimal_parsing_rejects_garbage() {
        assert!(Rational::from_decimal_str("").is_none());
        assert!(Rational::from_decimal_str("1.2.3").is_none());
        assert!(Rational::from_decimal_str("0x8").is_none());
        assert!(Rational::from_decimal_str("abc").is_none());
    }

    #[test]
    fn common_denominator_only_touches_what_must_change() {
        // 1/4, 1/6, 3/4 → LCM(4,6,4)=12. The 3/4 and 1/4 entries get
        // rescaled; structurally the function leaves den==common alone.
        let rs = [
            Rational::new(1, 4).unwrap(),
            Rational::new(1, 6).unwrap(),
            Rational::new(3, 4).unwrap(),
        ];
        let (common, nums) = over_common_denominator(&rs).unwrap();
        assert_eq!(common, 12);
        assert_eq!(nums, vec![3, 2, 9]); // 3/12, 2/12, 9/12
    }

    #[test]
    fn common_denominator_identity_when_all_equal() {
        // All already share denominator 5 → untouched, common stays 5.
        let rs = [
            Rational::new(1, 5).unwrap(),
            Rational::new(2, 5).unwrap(),
            Rational::new(3, 5).unwrap(),
        ];
        let (common, nums) = over_common_denominator(&rs).unwrap();
        assert_eq!(common, 5);
        assert_eq!(nums, vec![1, 2, 3]);
    }
}
