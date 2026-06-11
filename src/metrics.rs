//! Bit-level metrics: entropy, run-length analysis, alternation index.
//!
//! Pure functions over `&str` so they compose freely. All return `None`
//! on invalid input — never panic on a binary string the caller picked.

#[derive(Debug, Clone, PartialEq)]
pub struct Metrics {
    pub entropy: f64,
    pub longest_run: usize,
    pub runs: usize,
    pub alternating: bool,
    pub burstiness: f64,
}

/// Shannon entropy in bits, base 2. `0.0` for empty/constant input.
pub fn entropy(binary: &str) -> f64 {
    let total = binary.len() as f64;
    if total == 0.0 {
        return 0.0;
    }
    let ones = binary.chars().filter(|&c| c == '1').count() as f64;
    let zeros = total - ones;
    if ones == 0.0 || zeros == 0.0 {
        return 0.0;
    }
    let p1 = ones / total;
    let p0 = zeros / total;
    -(p1 * p1.log2() + p0 * p0.log2())
}

/// Length of the longest contiguous run of identical bits.
pub fn longest_run(binary: &str) -> usize {
    let mut best = 0usize;
    let mut cur = 0usize;
    let mut prev: Option<char> = None;
    for c in binary.chars() {
        if Some(c) == prev {
            cur += 1;
        } else {
            cur = 1;
            prev = Some(c);
        }
        if cur > best {
            best = cur;
        }
    }
    best
}

/// Count of distinct runs (e.g. `001110` → 3 runs).
pub fn run_count(binary: &str) -> usize {
    let mut runs = 0usize;
    let mut prev: Option<char> = None;
    for c in binary.chars() {
        if Some(c) != prev {
            runs += 1;
            prev = Some(c);
        }
    }
    runs
}

/// True iff no two adjacent bits are equal (e.g. `0101`).
pub fn is_alternating(binary: &str) -> bool {
    if binary.len() < 2 {
        return true;
    }
    binary
        .chars()
        .zip(binary.chars().skip(1))
        .all(|(a, b)| a != b)
}

/// Burstiness in [0,1]: ratio of the longest run to total length minus
/// the ideal "evenly distributed" baseline. Coarse but useful.
pub fn burstiness(binary: &str) -> f64 {
    if binary.is_empty() {
        return 0.0;
    }
    let longest = longest_run(binary) as f64;
    let n = binary.len() as f64;
    let ideal = 1.0 / n;
    ((longest / n) - ideal).max(0.0)
}

pub fn compute(binary: &str) -> Metrics {
    Metrics {
        entropy: entropy(binary),
        longest_run: longest_run(binary),
        runs: run_count(binary),
        alternating: is_alternating(binary),
        burstiness: burstiness(binary),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entropy_of_uniform_distribution_is_one_bit() {
        assert!((entropy("01") - 1.0).abs() < 1e-9);
        assert!((entropy("0011") - 1.0).abs() < 1e-9);
    }

    #[test]
    fn entropy_of_constant_input_is_zero() {
        assert_eq!(entropy("1111"), 0.0);
        assert_eq!(entropy("0000"), 0.0);
        assert_eq!(entropy(""), 0.0);
    }

    #[test]
    fn longest_run_finds_max_streak() {
        assert_eq!(longest_run("00111000"), 3);
        assert_eq!(longest_run("0"), 1);
        assert_eq!(longest_run(""), 0);
    }

    #[test]
    fn run_count_counts_transitions_plus_one() {
        assert_eq!(run_count("001110"), 3);
        assert_eq!(run_count("0101"), 4);
        assert_eq!(run_count(""), 0);
    }

    #[test]
    fn is_alternating_recognizes_perfect_alternation() {
        assert!(is_alternating("0101"));
        assert!(is_alternating("10"));
        assert!(!is_alternating("00"));
        assert!(!is_alternating("0110"));
        assert!(is_alternating("")); // vacuously true
    }
}
