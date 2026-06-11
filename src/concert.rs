//! Concert identity — joining several byte buckets so all the bits work
//! in concert as one coherent identity.
//!
//! The problem the operator named: identity rules stop holding when data
//! spans several *dimensions* (different scales / denominators). Hashing
//! the raw bits of each bucket independently loses their relationship;
//! concatenating them blindly mixes incompatible dimensions. The concert
//! identity fixes both:
//!
//! 1. **Normalize dimensions first.** Every rational bucket is reduced to
//!    lowest terms, and the whole set is lifted onto the LCM of its
//!    denominators — but only the buckets whose denominator differs are
//!    rescaled (`crate::rational::over_common_denominator`, "solo donde
//!    necesario"). After this step every rational bucket speaks the same
//!    dimension, so they can work together.
//! 2. **Fold into one identity.** A single canonical record carries the
//!    common denominator and every bucket in order. The BLID over that
//!    record depends on every bit of every bucket: drop a bucket, reorder
//!    them, or flip one bit and the concert identity changes — yet the
//!    same buckets in the same arrangement always converge (content-
//!    addressed, route-independent).
//!
//! Two buckets or twenty: the construction is the same.
//!
//! Canonical record (v1):
//! ```text
//! concert/v1\n<bucket count>\ncommon_den=<D>\n
//! <kind>:<canonical content>\n   …one line per bucket, in order…
//! ```
//! - bits bucket  → `bits:<0/1 string>`
//! - ratio bucket → `ratio:<numerator-over-common-D>`  (integer only)
//!
//! Unkeyed = public commitment; pass a key for the HMAC (private) form.

use crate::blid::Blid;
use crate::rational::{over_common_denominator, Rational};

/// One bucket of bits to be played in concert with others.
#[derive(Debug, Clone, PartialEq)]
pub enum Bucket {
    /// A raw bit string (ASCII 0/1).
    Bits(String),
    /// A rational observation (carries a dimension = its denominator).
    Ratio(Rational),
}

#[derive(Debug, Clone, PartialEq)]
pub enum ConcertError {
    /// The LCM of the rational denominators overflowed i128.
    DimensionOverflow,
    /// A bits bucket contained a non-0/1 byte.
    NonBinaryBucket(usize),
    /// No buckets supplied.
    Empty,
}

impl std::fmt::Display for ConcertError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConcertError::DimensionOverflow => {
                write!(f, "common dimension (LCM of denominators) overflowed i128")
            }
            ConcertError::NonBinaryBucket(i) => {
                write!(f, "bucket {} contains non-binary characters", i)
            }
            ConcertError::Empty => write!(f, "no buckets to join"),
        }
    }
}

/// Build the canonical concert record for the given buckets. Pure and
/// deterministic; the BLID is computed over the string this returns.
pub fn concert_record(buckets: &[Bucket]) -> Result<String, ConcertError> {
    if buckets.is_empty() {
        return Err(ConcertError::Empty);
    }
    for (i, b) in buckets.iter().enumerate() {
        if let Bucket::Bits(s) = b {
            if !s.bytes().all(|c| c == b'0' || c == b'1') {
                return Err(ConcertError::NonBinaryBucket(i));
            }
        }
    }

    // Lift all rational buckets onto the common LCM denominator.
    let ratios: Vec<Rational> = buckets
        .iter()
        .filter_map(|b| match b {
            Bucket::Ratio(r) => Some(*r),
            _ => None,
        })
        .collect();
    let (common_den, common_nums) =
        over_common_denominator(&ratios).ok_or(ConcertError::DimensionOverflow)?;

    let mut rec = format!("concert/v1\n{}\ncommon_den={}\n", buckets.len(), common_den);
    let mut ratio_idx = 0usize;
    for b in buckets {
        match b {
            Bucket::Bits(s) => {
                rec.push_str("bits:");
                rec.push_str(s);
                rec.push('\n');
            }
            Bucket::Ratio(_) => {
                rec.push_str("ratio:");
                rec.push_str(&common_nums[ratio_idx].to_string());
                rec.push('\n');
                ratio_idx += 1;
            }
        }
    }
    Ok(rec)
}

/// The concert BLID: one identity over all buckets, dimensions
/// reconciled via LCM. `key = None` → public commitment; `Some(k)` →
/// HMAC-keyed private form.
pub fn concert_blid(buckets: &[Bucket], key: Option<&str>) -> Result<Blid, ConcertError> {
    let rec = concert_record(buckets)?;
    Ok(match key {
        Some(k) => Blid::keyed_of_record(k, &rec),
        None => Blid::of_record(&rec),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn bits(s: &str) -> Bucket {
        Bucket::Bits(s.to_string())
    }
    fn ratio(n: i128, d: i128) -> Bucket {
        Bucket::Ratio(Rational::new(n, d).unwrap())
    }

    #[test]
    fn two_buckets_join_into_one_identity() {
        let id = concert_blid(&[bits("0101"), bits("1010")], None).unwrap();
        assert_eq!(id.short().len(), 16);
        // Deterministic: same buckets, same arrangement → same identity.
        let again = concert_blid(&[bits("0101"), bits("1010")], None).unwrap();
        assert_eq!(id, again);
    }

    #[test]
    fn order_is_part_of_the_identity() {
        let ab = concert_blid(&[bits("0101"), bits("1010")], None).unwrap();
        let ba = concert_blid(&[bits("1010"), bits("0101")], None).unwrap();
        assert_ne!(ab, ba, "reordering buckets must change the concert");
    }

    #[test]
    fn every_bit_participates() {
        let base = concert_blid(&[bits("0101"), bits("1010")], None).unwrap();
        let flip = concert_blid(&[bits("0101"), bits("1011")], None).unwrap();
        assert_ne!(base, flip, "a single flipped bit must change the concert");
    }

    #[test]
    fn dropping_a_bucket_changes_the_identity() {
        let two = concert_blid(&[bits("0101"), bits("1010")], None).unwrap();
        let one = concert_blid(&[bits("0101")], None).unwrap();
        assert_ne!(two, one);
    }

    #[test]
    fn rational_buckets_are_dimension_invariant() {
        // 1/2 and 2/4 are the same dimension-normalized identity, so a
        // concert built from either converges.
        let a = concert_blid(&[ratio(1, 2), bits("11")], None).unwrap();
        let b = concert_blid(&[ratio(2, 4), bits("11")], None).unwrap();
        assert_eq!(a, b, "scale leaked into the concert identity");
    }

    #[test]
    fn lcm_brings_mixed_dimensions_into_concert() {
        // 1/4 and 1/6 live in different dimensions; the concert lifts
        // them onto LCM(4,6)=12 → numerators 3 and 2. The record must
        // carry common_den=12.
        let rec = concert_record(&[ratio(1, 4), ratio(1, 6)]).unwrap();
        assert!(rec.contains("common_den=12"), "{}", rec);
        assert!(rec.contains("ratio:3"));
        assert!(rec.contains("ratio:2"));
    }

    #[test]
    fn mixed_bits_and_ratios_compose() {
        let id = concert_blid(&[bits("0101"), ratio(3, 7), bits("11110000")], None);
        assert!(id.is_ok());
    }

    #[test]
    fn keyed_concert_differs_and_converges() {
        let pub_id = concert_blid(&[bits("0101"), bits("1010")], None).unwrap();
        let k1 = concert_blid(&[bits("0101"), bits("1010")], Some("k")).unwrap();
        let k2 = concert_blid(&[bits("0101"), bits("1010")], Some("k")).unwrap();
        assert_ne!(pub_id, k1);
        assert_eq!(k1, k2);
    }

    #[test]
    fn errors_are_surfaced_not_swallowed() {
        assert_eq!(concert_blid(&[], None).unwrap_err(), ConcertError::Empty);
        assert_eq!(
            concert_record(&[bits("01"), bits("0x2")]).unwrap_err(),
            ConcertError::NonBinaryBucket(1)
        );
    }
}
