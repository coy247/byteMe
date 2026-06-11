//! Interdimensional loop import.
//!
//! Ingests (vector, scalar) observation pairs from the booLang-hardening
//! loop studies and analyzes them through byteme's lens. Each vector
//! `[a, b]` is read as a density observation — `a` hits out of `b`
//! positions — which is the compressed form of a binary string's
//! ones/length summary. That lets byteme compute the theoretical Shannon
//! entropy of the observed density without materializing `b` bits.
//!
//! Each entry and the whole run get a BLID, so two independent imports of
//! the same study converge on the same identifiers — the loop results
//! become content-addressed records that can be deduplicated and
//! cross-verified by ID alone.
//!
//! Canonical record form (v1), used for BLIDs:
//! ```text
//! entry:  loop-entry/v1\n<a>/<b> <scalar>
//! run:    loop-run/v1\n<entry-blid-full>\n...one line per entry...
//! ```
//! Scalars are canonicalized with Rust's shortest-roundtrip float
//! formatting; integers print without a decimal point.

use crate::blid::Blid;

/// The booLang-hardening study set, embedded verbatim.
/// 32 vectors, 32 scalars, index-aligned.
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

pub const STUDY_SCALARS: [f64; 32] = [
    -1977345647.0,
    -1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    0.1,
    0.7,
    0.8,
    0.9113,
    0.94,
    3.0,
    5.822,
    128.0,
];

#[derive(Debug, Clone, PartialEq)]
pub struct LoopEntry {
    pub index: usize,
    pub a: u64,
    pub b: u64,
    pub scalar: f64,
    /// a / b
    pub density: f64,
    /// Shannon entropy of a Bernoulli(density) source, in bits.
    pub entropy: f64,
    /// entropy × scalar — the study's weighted contribution.
    pub weighted: f64,
    pub blid_short: String,
    pub blid_full: String,
}

#[derive(Debug, Clone, PartialEq)]
pub struct LoopRun {
    pub entries: Vec<LoopEntry>,
    pub run_blid_short: String,
    pub run_blid_full: String,
}

/// Binary (Bernoulli) entropy of probability `p`, in bits.
/// Total: returns 0.0 outside (0,1) instead of NaN.
pub fn bernoulli_entropy(p: f64) -> f64 {
    if p <= 0.0 || p >= 1.0 {
        return 0.0;
    }
    let q = 1.0 - p;
    -(p * p.log2() + q * q.log2())
}

fn canon_scalar(s: f64) -> String {
    // Rust's `{}` float formatting is shortest-roundtrip and deterministic.
    format!("{}", s)
}

/// Analyze one observation. Returns `None` if the pair is malformed
/// (`b == 0` or `a > b`) — a study import must surface bad rows, not
/// silently absorb them.
pub fn analyze_entry(index: usize, a: u64, b: u64, scalar: f64) -> Option<LoopEntry> {
    if b == 0 || a > b {
        return None;
    }
    let density = a as f64 / b as f64;
    let entropy = bernoulli_entropy(density);
    let record = format!("loop-entry/v1\n{}/{} {}", a, b, canon_scalar(scalar));
    let blid = Blid::of_record(&record);
    Some(LoopEntry {
        index,
        a,
        b,
        scalar,
        density,
        entropy,
        weighted: entropy * scalar,
        blid_short: blid.short().to_string(),
        blid_full: blid.full().to_string(),
    })
}

/// Analyze a full (vectors, scalars) import. Errors if the lists are
/// length-mismatched or any row is malformed — partial imports are how
/// stale counters survive five weeks.
pub fn analyze_run(vectors: &[(u64, u64)], scalars: &[f64]) -> Result<LoopRun, String> {
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
            None => return Err(format!("malformed entry {}: [{}, {}]", i, a, b)),
        }
    }
    let mut run_record = String::from("loop-run/v1\n");
    for e in &entries {
        run_record.push_str(&e.blid_full);
        run_record.push('\n');
    }
    let run_blid = Blid::of_record(&run_record);
    Ok(LoopRun {
        entries,
        run_blid_short: run_blid.short().to_string(),
        run_blid_full: run_blid.full().to_string(),
    })
}

/// The embedded booLang-hardening study.
pub fn study_run() -> LoopRun {
    analyze_run(&STUDY_VECTORS, &STUDY_SCALARS)
        .expect("embedded study set is statically well-formed")
}

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
        let run = study_run();
        assert_eq!(run.entries.len(), 32);
    }

    #[test]
    fn entropy_math_on_known_pairs() {
        // [63, 100]: p = 0.63 → H ≈ 0.9505 bits (computed independently:
        // -(0.63·log2(0.63) + 0.37·log2(0.37)))
        let e = analyze_entry(25, 63, 100, 0.7).unwrap();
        assert!((e.density - 0.63).abs() < 1e-12);
        assert!((e.entropy - 0.9505).abs() < 5e-4, "entropy {}", e.entropy);
        assert!((e.weighted - 0.7 * e.entropy).abs() < 1e-12);
    }

    #[test]
    fn near_half_density_approaches_one_bit() {
        // [1347, 1387]: p ≈ 0.9712 → low entropy.
        // [3443, 5463]: p ≈ 0.6302 → high but < 1.
        // [262, 473]:   p ≈ 0.5539 → very close to 1 bit.
        let e = analyze_entry(8, 262, 473, 1.0).unwrap();
        assert!(
            e.entropy > 0.99,
            "expected near-1 entropy, got {}",
            e.entropy
        );
    }

    #[test]
    fn extreme_densities_have_low_entropy() {
        // [1, 53]: p ≈ 0.0189 → entropy well under half a bit.
        let e = analyze_entry(2, 1, 53, 1.0).unwrap();
        assert!(e.entropy < 0.2, "expected low entropy, got {}", e.entropy);
    }

    #[test]
    fn bernoulli_entropy_is_total_at_boundaries() {
        assert_eq!(bernoulli_entropy(0.0), 0.0);
        assert_eq!(bernoulli_entropy(1.0), 0.0);
        assert_eq!(bernoulli_entropy(-0.5), 0.0);
        assert_eq!(bernoulli_entropy(1.5), 0.0);
        assert!((bernoulli_entropy(0.5) - 1.0).abs() < 1e-12);
    }

    #[test]
    fn malformed_rows_are_rejected_not_absorbed() {
        assert!(analyze_entry(0, 5, 0, 1.0).is_none()); // b == 0
        assert!(analyze_entry(0, 10, 5, 1.0).is_none()); // a > b
        let r = analyze_run(&[(1, 2), (9, 3)], &[1.0, 1.0]);
        assert!(r.is_err());
        let r = analyze_run(&[(1, 2)], &[1.0, 2.0]);
        assert!(r.is_err(), "length mismatch must error");
    }

    #[test]
    fn run_blid_is_deterministic_across_independent_imports() {
        // Two independent routes, one BLID — the convergence property
        // applied to the whole study.
        let run1 = study_run();
        let run2 = analyze_run(&STUDY_VECTORS, &STUDY_SCALARS).unwrap();
        assert_eq!(run1.run_blid_full, run2.run_blid_full);
    }

    #[test]
    fn entry_blids_are_unique_within_study() {
        let run = study_run();
        let mut seen = std::collections::BTreeSet::new();
        for e in &run.entries {
            assert!(
                seen.insert(e.blid_full.clone()),
                "duplicate BLID at {}",
                e.index
            );
        }
    }

    #[test]
    fn scalar_canonicalization_distinguishes_close_values() {
        let a = analyze_entry(0, 1, 2, 0.9113).unwrap();
        let b = analyze_entry(0, 1, 2, 0.9114).unwrap();
        assert_ne!(a.blid_full, b.blid_full);
    }
}
