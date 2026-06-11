//! Binary string model: validation, basic counts, ratio.
//!
//! Port of `legacy/src/models/BinaryModel.js`. The 8 mocha assertions in
//! `legacy/tests/binaryModel.test.js` are reproduced as `#[test]` blocks
//! at the bottom of this file so the contract migrates with the code.

#[derive(Debug, Clone, PartialEq)]
pub struct BinaryAnalysis {
    pub length: usize,
    pub ones: usize,
    pub zeros: usize,
    pub ratio: f64,
}

#[derive(Debug, Clone)]
pub struct BinaryModel {
    binary: String,
}

impl BinaryModel {
    pub fn new<S: Into<String>>(binary: S) -> Self {
        Self {
            binary: binary.into(),
        }
    }

    pub fn binary(&self) -> &str {
        &self.binary
    }

    /// Accepts a non-empty string of only `0` and `1` characters.
    pub fn validate(&self) -> bool {
        !self.binary.is_empty() && self.binary.chars().all(|c| c == '0' || c == '1')
    }

    /// Returns counts and ratio if the input is valid, otherwise `None`.
    ///
    /// Contract preserved from the JS port:
    /// - all-ones → `ratio = f64::INFINITY`
    /// - all-zeros → `ratio = 0.0` (guards division-by-zero)
    pub fn analyze(&self) -> Option<BinaryAnalysis> {
        if !self.validate() {
            return None;
        }
        let ones = self.binary.chars().filter(|&c| c == '1').count();
        let zeros = self.binary.chars().filter(|&c| c == '0').count();
        let ratio = if zeros == 0 {
            if ones == 0 {
                0.0
            } else {
                f64::INFINITY
            }
        } else {
            ones as f64 / zeros as f64
        };
        Some(BinaryAnalysis {
            length: self.binary.len(),
            ones,
            zeros,
            ratio,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn validate_accepts_only_binary() {
        assert!(BinaryModel::new("10110").validate());
    }

    #[test]
    fn validate_rejects_non_binary_chars() {
        assert!(!BinaryModel::new("10210").validate());
        assert!(!BinaryModel::new("hello").validate());
        assert!(!BinaryModel::new("1011 0").validate());
    }

    #[test]
    fn validate_rejects_empty_string() {
        assert!(!BinaryModel::new("").validate());
    }

    #[test]
    fn analyze_counts_mixed_input() {
        let r = BinaryModel::new("110100").analyze().unwrap();
        assert_eq!(r.length, 6);
        assert_eq!(r.ones, 3);
        assert_eq!(r.zeros, 3);
        assert_eq!(r.ratio, 1.0);
    }

    #[test]
    fn analyze_all_zeros_returns_ratio_zero() {
        let r = BinaryModel::new("0000").analyze().unwrap();
        assert_eq!(r.ones, 0);
        assert_eq!(r.zeros, 4);
        assert_eq!(r.ratio, 0.0);
    }

    #[test]
    fn analyze_all_ones_returns_infinity_ratio() {
        // Documented contract carried over from the JS port — a future
        // fix would be a conscious API change.
        let r = BinaryModel::new("1111").analyze().unwrap();
        assert_eq!(r.ones, 4);
        assert_eq!(r.zeros, 0);
        assert_eq!(r.ratio, f64::INFINITY);
    }

    #[test]
    fn analyze_invalid_input_returns_none() {
        assert!(BinaryModel::new("12345").analyze().is_none());
    }

    #[test]
    fn binary_returns_original_string() {
        assert_eq!(BinaryModel::new("0101").binary(), "0101");
    }
}
