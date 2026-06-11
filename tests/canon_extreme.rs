//! Extreme-value and exhaustive tests for the canon module.
//!
//! Philosophy: "la calidad del resultado es solo tan válida como la
//! intensidad de los exámenes." Sampled tests suggest; exhaustive and
//! boundary tests *prove* (within their domain). This file:
//!
//! - proves NAF exactness/non-adjacency for EVERY i16 (65,536 cases,
//!   exhaustive — not sampled),
//! - hammers the i128 boundary values that broke the first NAF
//!   implementation (i128::MAX panicked on `v -= −1` overflow),
//! - proves ingest() is total (never panics) over adversarial garbage,
//! - proves the zero-and-one guarantee exhaustively for ALL bit strings
//!   up to length 12 (8,190 strings),
//! - proves process-level repeatability: identical invocations produce
//!   byte-identical output.

use byteme::canon::{self, Ingested};
use std::process::Command;

/// Evaluate a NAF decomposition with wrapping arithmetic. Powers may
/// reach 127 (e.g. for i128::MAX = +2^127 −2^0); wrapping two's-
/// complement arithmetic is exact modulo 2^128, and since the true value
/// fits in i128, congruence implies equality.
fn eval_naf_wrapping(d: &[(i8, u32)]) -> i128 {
    d.iter().fold(0i128, |acc, &(s, k)| {
        let term = 1i128.wrapping_shl(k);
        if s > 0 {
            acc.wrapping_add(term)
        } else {
            acc.wrapping_sub(term)
        }
    })
}

fn assert_naf_contract(v: i128) {
    let d = canon::naf(v);
    assert_eq!(eval_naf_wrapping(&d), v, "NAF not exact for {}", v);
    for w in d.windows(2) {
        assert!(
            w[1].1 >= w[0].1 + 2,
            "adjacent NAF digits for {}: powers {} and {}",
            v,
            w[0].1,
            w[1].1
        );
    }
    for &(s, _) in &d {
        assert!(s == 1 || s == -1, "NAF digit out of {{-1,+1}} for {}", v);
    }
}

#[test]
fn naf_exhaustive_over_all_i16() {
    // 65,536 cases — every single i16. Exhaustive, not sampled.
    for v in i16::MIN..=i16::MAX {
        assert_naf_contract(v as i128);
    }
}

#[test]
fn naf_at_the_i128_boundaries() {
    // The first implementation panicked at i128::MAX. These pins make
    // that regression impossible to reintroduce silently.
    for v in [
        i128::MAX,
        i128::MIN,
        i128::MAX - 1,
        i128::MIN + 1,
        (1i128 << 126),
        (1i128 << 126) - 1,
        -(1i128 << 126),
        -(1i128 << 126) - 1,
        0,
        1,
        -1,
    ] {
        assert_naf_contract(v);
    }
    // Structural pins at the extremes:
    // MAX = 2^127 − 1 → NAF is exactly +2^127 −2^0.
    assert_eq!(canon::naf(i128::MAX), vec![(-1, 0), (1, 127)]);
    // MIN = −2^127 → single digit −2^127.
    assert_eq!(canon::naf(i128::MIN), vec![(-1, 127)]);
}

#[test]
fn naf_negation_mirrors_digits() {
    // NAF(−v) must be NAF(v) with every digit negated — for every i12.
    for v in 1i128..=4096 {
        let pos = canon::naf(v);
        let neg = canon::naf(-v);
        assert_eq!(pos.len(), neg.len());
        for (&(ds, dk), &(ns, nk)) in pos.iter().zip(neg.iter()) {
            assert_eq!(dk, nk, "power mismatch at {}", v);
            assert_eq!(ds, -ns, "sign not mirrored at {}", v);
        }
    }
}

#[test]
fn ingest_is_total_over_adversarial_garbage() {
    // None of these may panic. Wrong-but-graceful (Text or error) is
    // acceptable; a crash is not.
    let nasty = [
        "2^",
        "2^^3",
        "2^-1",
        "2^3+",
        "+",
        "-",
        "--",
        "[",
        "]",
        "[[1],2]",
        "[1,,2]",
        "[,]",
        "[ ]",
        "[-]",
        "[--1]",
        "２^３",
        "8.5",
        "1e10",
        "0x08",
        " ",
        "\t",
        "ñ",
        "👾",
        "2^128",
        "2^127",
        "2^99999999999",
        "[170141183460469231731687303715884105728]",
        "∞",
        "NaN",
        "null",
        "2^3+2^3+2^3",
        "−8",
        "[1, 2, ",
        "1 0 1 a",
        "01x10",
    ];
    for s in nasty {
        let _ = canon::ingest(s); // must not panic, whatever it returns
    }
}

#[test]
fn ingest_array_element_overflow_is_error_not_panic() {
    // One past i128::MAX inside an array.
    let r = canon::ingest("[170141183460469231731687303715884105728]");
    assert!(r.is_err(), "overflowing array element must be an error");
}

#[test]
fn ingest_handles_i128_extremes_exactly() {
    let max = i128::MAX.to_string();
    match canon::ingest(&max).unwrap() {
        Ingested::Int { value, .. } => assert_eq!(value, i128::MAX),
        other => panic!("i128::MAX must ingest as Int, got {:?}", other),
    }
    let min = i128::MIN.to_string();
    match canon::ingest(&min).unwrap() {
        Ingested::Int { value, .. } => assert_eq!(value, i128::MIN),
        other => panic!("i128::MIN must ingest as Int, got {:?}", other),
    }
    // BLIDs at the extremes are stable and distinct.
    assert_ne!(
        canon::ingest(&max).unwrap().blid(),
        canon::ingest(&min).unwrap().blid()
    );
}

#[test]
fn zero_and_one_guarantee_exhaustive_to_length_12() {
    // EVERY bit string of length 1..=12 (8,190 strings) must ingest as
    // Bits — including "0", "1", "10", "11111111", all of them.
    for len in 1..=12u32 {
        for n in 0..(1u32 << len) {
            let s: String = (0..len)
                .rev()
                .map(|i| if (n >> i) & 1 == 1 { '1' } else { '0' })
                .collect();
            match canon::ingest(&s) {
                Ok(Ingested::Bits { ref bits }) => assert_eq!(bits, &s),
                other => panic!("bit string {:?} misrouted: {:?}", s, other),
            }
        }
    }
}

/// True iff the decimal rendering of `v` contains only 0/1 digits — in
/// which case plain-decimal input routes to Bits under the zero-and-one
/// guarantee and the *number* is only reachable via formula input.
fn decimal_looks_binary(v: i128) -> bool {
    v.to_string().bytes().all(|b| b == b'0' || b == b'1')
}

#[test]
fn formula_routes_converge_exhaustively_for_sums_to_64() {
    // Every 2^n + 2^m with n,m ≤ 6 (49 combinations, exhaustive):
    // the formula must ingest as Int with the exact value, and its BLID
    // must equal the canonical int identity. Where the decimal rendering
    // does NOT look binary, the plain-decimal route must converge too.
    //
    // This exhaustive sweep found the documented boundary the sampled
    // tests missed: values like 10 (= 2^3+2^1) render as 0/1-only
    // decimals, which the zero-and-one guarantee routes to Bits — so the
    // NUMBER ten is only reachable via formula. That precedence is the
    // operator's explicit choice; the collision is asserted below, not
    // hidden.
    for n in 0..=6u32 {
        for m in 0..=6u32 {
            let value = (1i128 << n) + (1i128 << m);
            let via_formula = canon::ingest(&format!("2^{}+2^{}", n, m)).unwrap();
            match via_formula {
                Ingested::Int { value: got, .. } => assert_eq!(got, value),
                ref other => panic!("formula misrouted: {:?}", other),
            }
            if !decimal_looks_binary(value) {
                let via_decimal = canon::ingest(&value.to_string()).unwrap();
                assert_eq!(
                    via_formula.blid(),
                    via_decimal.blid(),
                    "2^{}+2^{} diverged from {}",
                    n,
                    m,
                    value
                );
            }
        }
    }
    // And subtraction: every 2^n − 2^m with m < n ≤ 7.
    for n in 1..=7u32 {
        for m in 0..n {
            let value = (1i128 << n) - (1i128 << m);
            let via_formula = canon::ingest(&format!("2^{}-2^{}", n, m)).unwrap();
            if !decimal_looks_binary(value) {
                let via_decimal = canon::ingest(&value.to_string()).unwrap();
                assert_eq!(via_formula.blid(), via_decimal.blid());
            }
        }
    }
}

#[test]
fn the_binary_looking_decimal_boundary_works_as_designed() {
    // "10" is two bits (the guarantee). The NUMBER ten is reachable only
    // via formula — and the two have different BLIDs, as they must.
    let as_bits = canon::ingest("10").unwrap();
    assert!(matches!(as_bits, Ingested::Bits { .. }));
    let as_number = canon::ingest("2^3+2^1").unwrap();
    match as_number {
        Ingested::Int { value, .. } => assert_eq!(value, 10),
        ref other => panic!("formula misrouted: {:?}", other),
    }
    assert_ne!(as_bits.blid(), as_number.blid());
}

// ---------- process-level repeatability ----------

fn run_bytes(args: &[&str]) -> Vec<u8> {
    Command::new(env!("CARGO_BIN_EXE_byteme"))
        .args(args)
        .output()
        .expect("binary should execute")
        .stdout
}

#[test]
fn identical_invocations_are_byte_identical() {
    // Repeatability at the process level: same input, same bytes out.
    // (The retro intro is excluded by design — it is intentionally
    // randomized decoration, never analysis output.)
    for args in [
        vec!["--json", "[25, 3319]"],
        vec!["--json", "8"],
        vec!["--loop", "--json"],
        vec!["--walk", "--json", "0101"],
        vec!["--blid", "2^4-2^3"],
        vec!["--no-color", "-v", "7"],
    ] {
        let a = run_bytes(&args);
        let b = run_bytes(&args);
        assert_eq!(a, b, "non-deterministic output for {:?}", args);
        assert!(!a.is_empty());
    }
}
