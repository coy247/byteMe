//! Pattern detection: sliding-window occurrence counts and classification.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq)]
pub struct PatternReport {
    pub occurrences: BTreeMap<String, usize>,
    pub classification: PatternKind,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PatternKind {
    Alternating,
    RunBased,
    Mixed,
    TooShort,
}

/// Count all sliding-window substrings of the given lengths.
///
/// Total over arbitrary input: non-binary strings (anything other than
/// ASCII `0`/`1`) return an empty map instead of panicking on multibyte
/// char boundaries. Callers that want an error should validate first via
/// [`crate::binary::BinaryModel::validate`].
pub fn occurrences(binary: &str, window_sizes: &[usize]) -> BTreeMap<String, usize> {
    let mut counts: BTreeMap<String, usize> = BTreeMap::new();
    if !binary.bytes().all(|b| b == b'0' || b == b'1') {
        return counts;
    }
    for &w in window_sizes {
        if w == 0 || w > binary.len() {
            continue;
        }
        for i in 0..=binary.len() - w {
            let key = &binary[i..i + w];
            *counts.entry(key.to_string()).or_insert(0) += 1;
        }
    }
    counts
}

/// Coarse classification used by the prediction layer.
pub fn classify(binary: &str) -> PatternKind {
    if binary.len() < 4 {
        return PatternKind::TooShort;
    }
    if crate::metrics::is_alternating(binary) {
        return PatternKind::Alternating;
    }
    let longest = crate::metrics::longest_run(binary);
    if longest as f64 / binary.len() as f64 >= 0.4 {
        return PatternKind::RunBased;
    }
    PatternKind::Mixed
}

pub fn report(binary: &str) -> PatternReport {
    PatternReport {
        occurrences: occurrences(binary, &[2, 4, 8, 16]),
        classification: classify(binary),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_alternating_strings() {
        assert_eq!(classify("01010101"), PatternKind::Alternating);
        assert_eq!(classify("1010"), PatternKind::Alternating);
    }

    #[test]
    fn classifies_run_based_strings() {
        assert_eq!(classify("11110000"), PatternKind::RunBased);
        assert_eq!(classify("0000011111"), PatternKind::RunBased);
    }

    #[test]
    fn classifies_mixed_strings() {
        assert_eq!(classify("10011001"), PatternKind::Mixed);
    }

    #[test]
    fn flags_short_inputs() {
        assert_eq!(classify("101"), PatternKind::TooShort);
    }

    #[test]
    fn occurrences_counts_overlapping_windows() {
        let c = occurrences("0101", &[2]);
        assert_eq!(c.get("01"), Some(&2));
        assert_eq!(c.get("10"), Some(&1));
    }
}
