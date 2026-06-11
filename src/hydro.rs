//! Thirds/water correction + 45° bipolar walk.
//!
//! Port of a booLang experiment. The construction, formalized:
//!
//! **Signed zero, no zero (bipolar).** Bit `0` → charge `−1`, bit `1` →
//! charge `+1`. The symbol zero does not exist; zero only *emerges* as a
//! sum. This is NRZ line coding from electronics, where the running sum
//! is the DC bias of the signal.
//!
//! **The 45° walk.** Consecutive non-overlapping bit pairs become
//! diagonal unit steps `(±1, ±1)` — the four possible pairs are exactly
//! the axis directions rotated 45°. Each diagonal is a quarter:
//!
//! ```text
//! pair  step      angle  quarter
//! 11 →  (+1,+1)    45°     25%
//! 01 →  (−1,+1)   135°     50%
//! 00 →  (−1,−1)   225°     75%
//! 10 →  (+1,−1)   315°    100%
//! ```
//!
//! Angles and percentages translate into a walk — a direction. The
//! string's final displacement has a magnitude and an angle; the angle
//! quantizes back to the nearest quarter.
//!
//! **Hydration (⅓ → H₂O).** Water is the 1:2 structure — one oxygen
//! (charge −2) and two hydrogens (charge +1 each), net **zero**. Applied
//! to the original measures by position: the first ⌊n/3⌋ charges are
//! weighted ×−2 (the oxygen span) and the remaining ones ×+1 (the
//! hydrogen span). For any constant signal whose length divides by 3 the
//! hydrated charge is exactly 0 — the DC bias is neutralized
//! *stoichiometrically*, and what survives measures structure relative to
//! the third boundary. Algebraic identity (tested):
//!
//! ```text
//! hydrated = raw − 3 · (bipolar sum of the oxygen span)
//! ```
//!
//! **Overflow.** The hydrated charge is also accumulated in a wrapping
//! 8-bit register (`i8`), electronics-style: the residue the hardware
//! would actually hold.
//!
//! Interpretation choices made when porting (delimited): the oxygen span
//! is the *first* third by position (chosen by the author); odd trailing
//! bits are dropped from the walk (flagged in the result); `⌊n/3⌋`
//! truncates, so constant strings with `n % 3 ≠ 0` are *near*-neutral,
//! not exactly neutral — that residue is reported, not hidden.

/// Charge of one bit under the bipolar (signed-zero-without-zero) map.
pub fn bipolar(bit: u8) -> i64 {
    if bit == b'1' {
        1
    } else {
        -1
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct Walk {
    /// Number of diagonal steps taken (⌊bits/2⌋).
    pub steps: usize,
    /// True if the input had odd length and the last bit was dropped.
    pub odd_bit_dropped: bool,
    /// Final displacement.
    pub x: i64,
    pub y: i64,
    /// Euclidean magnitude of the displacement.
    pub magnitude: f64,
    /// Angle of the displacement in degrees, [0, 360). None at origin.
    pub angle_deg: Option<f64>,
    /// Nearest quarter (25/50/75/100) to the final angle. None at origin.
    pub quarter: Option<u8>,
    /// Step counts per quarter: [25%, 50%, 75%, 100%].
    pub quarter_counts: [usize; 4],
}

/// Walk the string two bits at a time, each pair a diagonal step.
pub fn walk(binary: &str) -> Walk {
    let bytes = binary.as_bytes();
    let steps = bytes.len() / 2;
    let odd_bit_dropped = bytes.len() % 2 == 1;
    let (mut x, mut y) = (0i64, 0i64);
    let mut quarter_counts = [0usize; 4];

    for pair in bytes.chunks_exact(2) {
        let dx = bipolar(pair[0]);
        let dy = bipolar(pair[1]);
        x += dx;
        y += dy;
        let idx = match (dx, dy) {
            (1, 1) => 0,   // 45°  → 25%
            (-1, 1) => 1,  // 135° → 50%
            (-1, -1) => 2, // 225° → 75%
            _ => 3,        // 315° → 100%
        };
        quarter_counts[idx] += 1;
    }

    let magnitude = ((x * x + y * y) as f64).sqrt();
    let (angle_deg, quarter) = if x == 0 && y == 0 {
        (None, None)
    } else {
        let mut a = (y as f64).atan2(x as f64).to_degrees();
        if a < 0.0 {
            a += 360.0;
        }
        // Quantize to the nearest diagonal: 45/135/225/315 ↔ 25/50/75/100.
        let diagonals = [45.0, 135.0, 225.0, 315.0];
        let quarters = [25u8, 50, 75, 100];
        let mut best = 0usize;
        let mut best_d = f64::MAX;
        for (i, d) in diagonals.iter().enumerate() {
            let mut delta = (a - d).abs();
            if delta > 180.0 {
                delta = 360.0 - delta;
            }
            if delta < best_d {
                best_d = delta;
                best = i;
            }
        }
        (Some(a), Some(quarters[best]))
    };

    Walk {
        steps,
        odd_bit_dropped,
        x,
        y,
        magnitude,
        angle_deg,
        quarter,
        quarter_counts,
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct Hydration {
    /// Raw bipolar sum — the original measure (DC bias).
    pub raw_charge: i64,
    /// Water-weighted sum: oxygen span ×−2, hydrogen span ×+1.
    pub hydrated_charge: i64,
    /// hydrated − raw: what the conversion changed ("un poquitillo").
    pub correction: i64,
    /// Length of the oxygen span: ⌊n/3⌋.
    pub oxygen_len: usize,
    /// Length of the hydrogen span: n − ⌊n/3⌋.
    pub hydrogen_len: usize,
    /// The hydrated charge as an 8-bit wrapping accumulator (overflow
    /// view, electronics-style).
    pub overflow_i8: i8,
    /// True iff the hydrated charge is exactly zero — water neutrality.
    pub neutral: bool,
}

/// Apply the thirds→water weighting to the original measures.
pub fn hydrate(binary: &str) -> Hydration {
    let bytes = binary.as_bytes();
    let n = bytes.len();
    let oxygen_len = n / 3;
    let hydrogen_len = n - oxygen_len;

    let mut raw: i64 = 0;
    let mut hydrated: i64 = 0;
    let mut overflow: i8 = 0;
    for (i, &b) in bytes.iter().enumerate() {
        let q = bipolar(b);
        raw += q;
        let weighted = if i < oxygen_len { -2 * q } else { q };
        hydrated += weighted;
        overflow = overflow.wrapping_add(weighted as i8);
    }

    Hydration {
        raw_charge: raw,
        hydrated_charge: hydrated,
        correction: hydrated - raw,
        oxygen_len,
        hydrogen_len,
        overflow_i8: overflow,
        neutral: hydrated == 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bipolar_signed_zero_without_zero() {
        assert_eq!(bipolar(b'1'), 1);
        assert_eq!(bipolar(b'0'), -1);
        // No input maps to 0 — zero can only emerge as a sum.
    }

    #[test]
    fn four_pairs_are_the_four_diagonals() {
        let w = walk("11");
        assert_eq!((w.x, w.y), (1, 1));
        assert_eq!(w.angle_deg, Some(45.0));
        assert_eq!(w.quarter, Some(25));

        let w = walk("01");
        assert_eq!((w.x, w.y), (-1, 1));
        assert_eq!(w.angle_deg, Some(135.0));
        assert_eq!(w.quarter, Some(50));

        let w = walk("00");
        assert_eq!((w.x, w.y), (-1, -1));
        assert_eq!(w.angle_deg, Some(225.0));
        assert_eq!(w.quarter, Some(75));

        let w = walk("10");
        assert_eq!((w.x, w.y), (1, -1));
        assert_eq!(w.angle_deg, Some(315.0));
        assert_eq!(w.quarter, Some(100));
    }

    #[test]
    fn odd_trailing_bit_is_dropped_and_flagged() {
        let w = walk("111");
        assert_eq!(w.steps, 1);
        assert!(w.odd_bit_dropped);
        assert_eq!((w.x, w.y), (1, 1));
    }

    #[test]
    fn origin_walk_has_no_direction() {
        // "1100" → (+1,+1) then (−1,−1) → back to origin.
        let w = walk("1100");
        assert_eq!((w.x, w.y), (0, 0));
        assert_eq!(w.angle_deg, None);
        assert_eq!(w.quarter, None);
        assert_eq!(w.magnitude, 0.0);
    }

    #[test]
    fn alternating_string_marches_at_135() {
        // "010101": pairs 01,01,01 → all (−1,+1).
        let w = walk("010101");
        assert_eq!((w.x, w.y), (-3, 3));
        assert_eq!(w.quarter, Some(50));
        assert_eq!(w.quarter_counts, [0, 3, 0, 0]);
    }

    #[test]
    fn constant_strings_neutralize_exactly_when_divisible_by_three() {
        // All ones, n = 9: raw = 9, oxygen span 3×(−2) = −6, hydrogen
        // span 6×(+1) = +6 → hydrated 0. Same for all zeros, mirrored.
        let h = hydrate("111111111");
        assert_eq!(h.raw_charge, 9);
        assert_eq!(h.hydrated_charge, 0);
        assert!(h.neutral);

        let h = hydrate("000000000");
        assert_eq!(h.raw_charge, -9);
        assert_eq!(h.hydrated_charge, 0);
        assert!(h.neutral);
    }

    #[test]
    fn remainder_residue_is_reported_not_hidden() {
        // n = 10 (n % 3 = 1): oxygen span ⌊10/3⌋ = 3, hydrogen 7.
        // All ones: hydrated = 3×(−2) + 7×(+1) = +1 — near-neutral.
        let h = hydrate("1111111111");
        assert_eq!(h.oxygen_len, 3);
        assert_eq!(h.hydrogen_len, 7);
        assert_eq!(h.hydrated_charge, 1);
        assert!(!h.neutral);
    }

    #[test]
    fn algebraic_identity_hydrated_equals_raw_minus_three_oxygen_sum() {
        // hydrated = raw − 3·Σ(oxygen span), for any input.
        for s in ["110100", "0101010101", "1", "10", "111000111000", "0"] {
            let h = hydrate(s);
            let o_sum: i64 = s.as_bytes()[..h.oxygen_len]
                .iter()
                .map(|&b| bipolar(b))
                .sum();
            assert_eq!(
                h.hydrated_charge,
                h.raw_charge - 3 * o_sum,
                "identity failed for {:?}",
                s
            );
        }
    }

    #[test]
    fn correction_is_the_documented_delta() {
        let h = hydrate("110100");
        assert_eq!(h.correction, h.hydrated_charge - h.raw_charge);
    }

    #[test]
    fn overflow_register_matches_wrapped_reference() {
        // The i8 accumulator must equal the true sum reduced mod 256.
        for s in ["1111111111", "000111", "10101010101010101010"] {
            let h = hydrate(s);
            assert_eq!(
                h.overflow_i8 as i64,
                ((h.hydrated_charge % 256) + 256) % 256
                    - if ((h.hydrated_charge % 256) + 256) % 256 > 127 {
                        256
                    } else {
                        0
                    }
            );
        }
    }

    #[test]
    fn water_is_one_third_two_thirds() {
        // The spans must always be exactly ⌊n/3⌋ and n − ⌊n/3⌋.
        for n in 1..50usize {
            let s = "1".repeat(n);
            let h = hydrate(&s);
            assert_eq!(h.oxygen_len, n / 3);
            assert_eq!(h.oxygen_len + h.hydrogen_len, n);
        }
    }
}
