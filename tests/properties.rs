//! Property-based tests with a deterministic hand-rolled harness.
//!
//! No proptest/quickcheck dependency: a fixed-seed LCG generates 1,000
//! random cases per property, so every CI run executes the identical case
//! set — failures are reproducible by seed, not flaky.
//!
//! Seed: 0xB17E_5EED (cited here so a failure report can name it).

use byteme::{binary::BinaryModel, encode, metrics, patterns};

const SEED: u64 = 0xB17E_5EED;
const CASES: usize = 1_000;

struct Lcg(u64);
impl Lcg {
    fn new(seed: u64) -> Self {
        Self(seed.wrapping_add(0x9E37_79B9_7F4A_7C15))
    }
    fn next(&mut self) -> u64 {
        self.0 = self
            .0
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        self.0
    }
    fn range(&mut self, n: u64) -> u64 {
        self.next() % n.max(1)
    }
}

fn random_binary(rng: &mut Lcg, max_len: usize) -> String {
    let len = rng.range(max_len as u64) as usize + 1;
    (0..len)
        .map(|_| if rng.next() & 1 == 0 { '0' } else { '1' })
        .collect()
}

fn random_text(rng: &mut Lcg, max_len: usize) -> String {
    // Printable ASCII incl. letters guaranteed non-binary-looking by
    // appending one alpha char.
    let len = rng.range(max_len as u64) as usize;
    let mut s: String = (0..len)
        .map(|_| (0x20 + rng.range(0x5F) as u8) as char)
        .collect();
    s.push((b'a' + rng.range(26) as u8) as char);
    s
}

#[test]
fn prop_ones_plus_zeros_equals_length() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 512);
        let a = BinaryModel::new(b.clone()).analyze().unwrap();
        assert_eq!(a.ones + a.zeros, a.length, "violated for {:?}", b);
    }
}

#[test]
fn prop_entropy_bounded_zero_to_one() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 512);
        let e = metrics::entropy(&b);
        assert!((0.0..=1.0).contains(&e), "entropy {} for {:?}", e, b);
    }
}

#[test]
fn prop_entropy_invariant_under_complement() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 512);
        let comp: String = b
            .chars()
            .map(|c| if c == '0' { '1' } else { '0' })
            .collect();
        assert_eq!(
            metrics::entropy(&b),
            metrics::entropy(&comp),
            "complement changed entropy for {:?}",
            b
        );
    }
}

#[test]
fn prop_entropy_invariant_under_reversal() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 512);
        let rev: String = b.chars().rev().collect();
        assert_eq!(
            metrics::entropy(&b),
            metrics::entropy(&rev),
            "reversal changed entropy for {:?}",
            b
        );
    }
}

#[test]
fn prop_longest_run_bounded_by_length() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 512);
        let lr = metrics::longest_run(&b);
        assert!(lr >= 1 && lr <= b.len(), "longest_run {} for {:?}", lr, b);
    }
}

#[test]
fn prop_runs_bounded_and_alternating_iff_runs_eq_len() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 512);
        let runs = metrics::run_count(&b);
        assert!(runs >= 1 && runs <= b.len(), "runs {} for {:?}", runs, b);
        assert_eq!(
            metrics::is_alternating(&b),
            runs == b.len(),
            "alternating⇔runs==len violated for {:?}",
            b
        );
    }
}

#[test]
fn prop_burstiness_bounded() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 512);
        let bu = metrics::burstiness(&b);
        assert!((0.0..1.0).contains(&bu), "burstiness {} for {:?}", bu, b);
    }
}

#[test]
fn prop_occurrence_counts_sum_to_window_positions() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let b = random_binary(&mut rng, 64);
        for w in [2usize, 4, 8, 16] {
            if w > b.len() {
                continue;
            }
            let occ = patterns::occurrences(&b, &[w]);
            let total: usize = occ.values().sum();
            assert_eq!(
                total,
                b.len() - w + 1,
                "window {} counts wrong for {:?}",
                w,
                b
            );
        }
    }
}

#[test]
fn prop_to_binary_emits_only_bits() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let t = random_text(&mut rng, 64);
        let b = encode::to_binary(&t);
        assert!(
            b.bytes().all(|c| c == b'0' || c == b'1'),
            "non-bit output for {:?}",
            t
        );
        assert_eq!(b.len() % 8, 0, "non-byte-aligned encoding for {:?}", t);
    }
}

#[test]
fn prop_encode_roundtrip_for_text() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let t = random_text(&mut rng, 64);
        let b = encode::to_binary(&t);
        assert_eq!(
            encode::from_binary(&b).as_deref(),
            Some(t.as_str()),
            "roundtrip failed for {:?}",
            t
        );
    }
}

#[test]
fn prop_occurrences_total_over_arbitrary_unicode() {
    // Regression for the multibyte panic: occurrences() must never panic,
    // whatever garbage arrives.
    let mut rng = Lcg::new(SEED);
    let nasty = ["ñ0101", "0👾1", "\u{0301}01", "日本語", "0101\u{FFFF}"];
    for s in nasty {
        let _ = patterns::occurrences(s, &[2, 4]); // must not panic
        let _ = patterns::report(s); // must not panic
    }
    for _ in 0..CASES {
        // Random UTF-8-ish soup from random codepoints
        let s: String = (0..rng.range(32))
            .filter_map(|_| char::from_u32(rng.range(0xD7FF) as u32))
            .collect();
        let _ = patterns::occurrences(&s, &[2, 4, 8]); // must not panic
    }
}

#[test]
fn prop_analyze_some_iff_validate() {
    let mut rng = Lcg::new(SEED);
    for _ in 0..CASES {
        let s = if rng.next() & 1 == 0 {
            random_binary(&mut rng, 64)
        } else {
            random_text(&mut rng, 64)
        };
        let m = BinaryModel::new(s.clone());
        assert_eq!(
            m.validate(),
            m.analyze().is_some(),
            "validate/analyze disagree for {:?}",
            s
        );
    }
}

#[test]
fn stress_hundred_thousand_bits_completes() {
    let mut rng = Lcg::new(SEED);
    let big = random_binary(&mut rng, 1);
    let big: String = std::iter::repeat(big).take(100_000).collect::<String>();
    let big = &big[..100_000.min(big.len())];
    let a = BinaryModel::new(big).analyze().unwrap();
    assert_eq!(a.length, big.len());
    let _ = metrics::compute(big);
    let _ = patterns::report(big);
}
