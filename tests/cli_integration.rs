//! Integration tests against the REAL compiled binary — not the library.
//! Uses the CARGO_BIN_EXE_byteme path cargo provides to integration tests.
//!
//! Includes a dependency-free recursive-descent JSON validator so "the
//! --json output is valid JSON" is *checked*, not eyeballed.

use std::process::Command;

fn run(args: &[&str]) -> (i32, String, String) {
    let out = Command::new(env!("CARGO_BIN_EXE_byteme"))
        .args(args)
        .output()
        .expect("binary should execute");
    (
        out.status.code().unwrap_or(-1),
        String::from_utf8_lossy(&out.stdout).into_owned(),
        String::from_utf8_lossy(&out.stderr).into_owned(),
    )
}

// ---------- minimal JSON validator (no serde) ----------

struct Json<'a> {
    b: &'a [u8],
    i: usize,
}

impl<'a> Json<'a> {
    fn new(s: &'a str) -> Self {
        Self {
            b: s.as_bytes(),
            i: 0,
        }
    }
    fn ws(&mut self) {
        while self.i < self.b.len() && matches!(self.b[self.i], b' ' | b'\n' | b'\r' | b'\t') {
            self.i += 1;
        }
    }
    fn peek(&self) -> Option<u8> {
        self.b.get(self.i).copied()
    }
    fn eat(&mut self, c: u8) -> bool {
        if self.peek() == Some(c) {
            self.i += 1;
            true
        } else {
            false
        }
    }
    fn value(&mut self) -> bool {
        self.ws();
        match self.peek() {
            Some(b'{') => self.object(),
            Some(b'[') => self.array(),
            Some(b'"') => self.string(),
            Some(b't') => self.lit(b"true"),
            Some(b'f') => self.lit(b"false"),
            Some(b'n') => self.lit(b"null"),
            Some(c) if c == b'-' || c.is_ascii_digit() => self.number(),
            _ => false,
        }
    }
    fn lit(&mut self, s: &[u8]) -> bool {
        if self.b[self.i..].starts_with(s) {
            self.i += s.len();
            true
        } else {
            false
        }
    }
    fn object(&mut self) -> bool {
        if !self.eat(b'{') {
            return false;
        }
        self.ws();
        if self.eat(b'}') {
            return true;
        }
        loop {
            self.ws();
            if !self.string() {
                return false;
            }
            self.ws();
            if !self.eat(b':') {
                return false;
            }
            if !self.value() {
                return false;
            }
            self.ws();
            if self.eat(b',') {
                continue;
            }
            return self.eat(b'}');
        }
    }
    fn array(&mut self) -> bool {
        if !self.eat(b'[') {
            return false;
        }
        self.ws();
        if self.eat(b']') {
            return true;
        }
        loop {
            if !self.value() {
                return false;
            }
            self.ws();
            if self.eat(b',') {
                continue;
            }
            return self.eat(b']');
        }
    }
    fn string(&mut self) -> bool {
        if !self.eat(b'"') {
            return false;
        }
        while let Some(c) = self.peek() {
            match c {
                b'"' => {
                    self.i += 1;
                    return true;
                }
                b'\\' => {
                    self.i += 1;
                    match self.peek() {
                        Some(b'"' | b'\\' | b'/' | b'b' | b'f' | b'n' | b'r' | b't') => self.i += 1,
                        Some(b'u') => {
                            self.i += 1;
                            for _ in 0..4 {
                                if !self.peek().is_some_and(|h| h.is_ascii_hexdigit()) {
                                    return false;
                                }
                                self.i += 1;
                            }
                        }
                        _ => return false,
                    }
                }
                0x00..=0x1F => return false, // raw control char = invalid
                _ => self.i += 1,
            }
        }
        false
    }
    fn number(&mut self) -> bool {
        let start = self.i;
        let _ = self.eat(b'-');
        while self.peek().is_some_and(|c| c.is_ascii_digit()) {
            self.i += 1;
        }
        if self.eat(b'.') {
            while self.peek().is_some_and(|c| c.is_ascii_digit()) {
                self.i += 1;
            }
        }
        if matches!(self.peek(), Some(b'e' | b'E')) {
            self.i += 1;
            if matches!(self.peek(), Some(b'+' | b'-')) {
                self.i += 1;
            }
            while self.peek().is_some_and(|c| c.is_ascii_digit()) {
                self.i += 1;
            }
        }
        self.i > start
    }
}

fn is_valid_json(s: &str) -> bool {
    let mut p = Json::new(s);
    if !p.value() {
        return false;
    }
    p.ws();
    p.i == p.b.len()
}

#[test]
fn json_validator_self_test() {
    assert!(is_valid_json(r#"{"a": 1, "b": [true, null, "x\ty"]}"#));
    assert!(!is_valid_json("{"));
    assert!(!is_valid_json(r#"{"a": }"#));
    assert!(!is_valid_json("{\"a\": \"raw\ttab\"}")); // raw control char
}

// ---------- actual binary behavior ----------

#[test]
fn exit_zero_on_valid_input_with_table_output() {
    let (code, stdout, _) = run(&["01001000"]);
    assert_eq!(code, 0);
    assert!(stdout.contains("ByteMe Analysis"));
    assert!(stdout.contains("Entropy"));
}

#[test]
fn exit_one_on_missing_input() {
    let (code, _, stderr) = run(&[]);
    assert_eq!(code, 1);
    assert!(stderr.contains("no input"));
}

#[test]
fn exit_one_on_unknown_flag() {
    let (code, _, stderr) = run(&["--bogus", "0101"]);
    assert_eq!(code, 1);
    assert!(stderr.contains("--bogus"));
}

#[test]
fn exit_two_on_empty_input() {
    let (code, _, _) = run(&[""]);
    assert_eq!(code, 2);
}

#[test]
fn json_output_is_actually_valid_json() {
    let (code, stdout, _) = run(&["--json", "10101010"]);
    assert_eq!(code, 0);
    assert!(is_valid_json(&stdout), "invalid JSON:\n{}", stdout);
}

#[test]
fn json_with_hostile_input_is_still_valid() {
    // Tab, quote, backslash in the input string — all must be escaped.
    let (code, stdout, _) = run(&["--json", "a\tb\"c\\d"]);
    assert_eq!(code, 0);
    assert!(is_valid_json(&stdout), "invalid JSON:\n{}", stdout);
}

#[test]
fn json_all_ones_ratio_is_null_not_infinity_token() {
    let (code, stdout, _) = run(&["--json", "1111"]);
    assert_eq!(code, 0);
    assert!(is_valid_json(&stdout), "invalid JSON:\n{}", stdout);
    assert!(
        stdout.contains("\"ratio\": null"),
        "expected null ratio:\n{}",
        stdout
    );
    assert!(!stdout.contains("inf"), "bare Infinity leaked:\n{}", stdout);
}

#[test]
fn version_flag_prints_semver() {
    let (code, stdout, _) = run(&["--version"]);
    assert_eq!(code, 0);
    assert!(stdout.starts_with("byteme "));
}

#[test]
fn help_flag_exits_zero() {
    let (code, stdout, _) = run(&["--help"]);
    assert_eq!(code, 0);
    assert!(stdout.contains("USAGE"));
}

#[test]
fn demo_runs_all_fixtures() {
    let (code, stdout, _) = run(&["--demo"]);
    assert_eq!(code, 0);
    assert_eq!(stdout.matches("ByteMe Analysis").count(), 3);
}

#[test]
fn no_color_output_has_no_ansi_escapes() {
    let (code, stdout, _) = run(&["--no-color", "0101"]);
    assert_eq!(code, 0);
    assert!(
        !stdout.contains('\x1b'),
        "ANSI escapes leaked:\n{:?}",
        stdout
    );
}

#[test]
fn piped_json_has_no_ansi_escapes() {
    let (_, stdout, _) = run(&["--json", "0101"]);
    assert!(!stdout.contains('\x1b'));
}

#[test]
fn text_and_equivalent_binary_inputs_converge() {
    // "Hi" encodes to 0100100001101001 — both routes must produce the
    // same analysis (two routes, one result).
    let (_, via_text, _) = run(&["--json", "--no-color", "Hi"]);
    let (_, via_bits, _) = run(&["--json", "--no-color", "0100100001101001"]);
    let strip = |s: &str| {
        s.lines()
            .filter(|l| !l.contains("\"input\""))
            .collect::<Vec<_>>()
            .join("\n")
    };
    assert_eq!(strip(&via_text), strip(&via_bits));
}

// ---------- BLID + interdimensional loop ----------

#[test]
fn blid_two_routes_converge_pinned() {
    // Pinned regression vector: if this changes, the canonical form
    // byteme/blid/v1 changed — that requires a version bump, not a test edit.
    let (c1, via_text, _) = run(&["--blid", "Hi"]);
    let (c2, via_bits, _) = run(&["--blid", "0100100001101001"]);
    assert_eq!(c1, 0);
    assert_eq!(c2, 0);
    assert_eq!(via_text, via_bits, "two routes must converge");
    assert_eq!(via_text.trim(), "a2fc4a037c913df5", "pinned BLID changed");
}

#[test]
fn blid_output_is_exactly_one_line_of_hex() {
    let (_, stdout, _) = run(&["--blid", "0101"]);
    let line = stdout.trim();
    assert_eq!(line.len(), 16);
    assert!(line.chars().all(|c| c.is_ascii_hexdigit()));
    assert_eq!(stdout.lines().count(), 1);
}

#[test]
fn loop_study_run_blid_pinned() {
    // The embedded booLang-hardening study (32 vectors + 32 scalars) must
    // always produce this run BLID. Any drift means the study data or the
    // canonical record form changed.
    let (code, stdout, _) = run(&["--loop", "--no-color"]);
    assert_eq!(code, 0);
    assert!(
        stdout.contains("ed4cd25fcbfab234"),
        "run BLID drifted:\n{}",
        stdout
    );
    assert!(stdout.contains("(32 entries)"));
}

#[test]
fn loop_json_is_valid_and_complete() {
    let (code, stdout, _) = run(&["--loop", "--json"]);
    assert_eq!(code, 0);
    assert!(is_valid_json(&stdout), "invalid JSON:\n{}", stdout);
    assert_eq!(stdout.matches("\"index\":").count(), 32);
    assert!(stdout.contains("\"run_blid\": \"ed4cd25fcbfab234\""));
}

#[test]
fn analysis_json_contains_blid_fields() {
    let (_, stdout, _) = run(&["--json", "0101"]);
    assert!(is_valid_json(&stdout));
    assert!(stdout.contains("\"blid\":"));
    assert!(stdout.contains("\"blid_sha256\":"));
}

// ---------- 45° walk + hydration (thirds → H₂O) ----------

#[test]
fn walk_constant_nine_ones_is_water_neutral() {
    let (code, stdout, _) = run(&["--walk", "--no-color", "111111111"]);
    assert_eq!(code, 0);
    assert!(stdout.contains("raw charge      +9"));
    assert!(stdout.contains("hydrated charge +0"));
    assert!(
        stdout.contains("neutral"),
        "expected water balance:\n{}",
        stdout
    );
}

#[test]
fn walk_alternating_marches_at_fifty_percent() {
    let (code, stdout, _) = run(&["--walk", "--no-color", "010101"]);
    assert_eq!(code, 0);
    assert!(stdout.contains("angle 135.0°"));
    assert!(stdout.contains("→ 50%"));
}

#[test]
fn walk_json_is_valid_and_structured() {
    let (code, stdout, _) = run(&["--walk", "--json", "010101"]);
    assert_eq!(code, 0);
    assert!(is_valid_json(&stdout), "invalid JSON:\n{}", stdout);
    assert!(stdout.contains("\"quarter\": 50"));
    assert!(stdout.contains("\"neutral\": true"));
    assert!(stdout.contains("\"blid\":"));
}

#[test]
fn walk_json_origin_walk_has_null_direction() {
    // "1100" returns to origin: angle and quarter must be null, not NaN.
    let (code, stdout, _) = run(&["--walk", "--json", "1100"]);
    assert_eq!(code, 0);
    assert!(is_valid_json(&stdout), "invalid JSON:\n{}", stdout);
    assert!(stdout.contains("\"angle_deg\": null"));
    assert!(stdout.contains("\"quarter\": null"));
    assert!(!stdout.to_lowercase().contains("nan"));
}

#[test]
fn h2o_alias_works() {
    let (c1, a, _) = run(&["--walk", "--json", "0101"]);
    let (c2, b, _) = run(&["--h2o", "--json", "0101"]);
    assert_eq!(c1, 0);
    assert_eq!(c2, 0);
    assert_eq!(a, b, "--h2o must be an exact alias of --walk");
}

// ---------- universal input (canon) ----------

#[test]
fn eight_collectively_three_routes_one_blid_pinned() {
    // La fórmula del ocho: 8 = 2^2+2^2 = 2^4−2^3. Three routes, one BLID.
    let (_, a, _) = run(&["--blid", "8"]);
    let (_, b, _) = run(&["--blid", "2^2+2^2"]);
    let (_, c, _) = run(&["--blid", "2^4-2^3"]);
    assert_eq!(a, b);
    assert_eq!(a, c);
    assert_eq!(a.trim(), "6979745b5e222ca3", "pinned int-8 BLID drifted");
}

#[test]
fn number_eight_and_bitstring_1000_are_different_content() {
    let (_, int8, _) = run(&["--blid", "8"]);
    let (_, bits, _) = run(&["--blid", "1000"]);
    assert_ne!(int8, bits, "domain separation violated");
    assert_eq!(
        bits.trim(),
        "0996b7bbd5325656",
        "pinned bits-1000 BLID drifted"
    );
}

#[test]
fn zero_and_one_keep_their_bit_meaning() {
    // The zero-and-one guarantee, end to end.
    let (c0, out0, _) = run(&["--no-color", "0"]);
    assert_eq!(c0, 0);
    assert!(out0.contains("Length           1 bits"));
    let (c1, out1, _) = run(&["--no-color", "1"]);
    assert_eq!(c1, 0);
    assert!(out1.contains("Length           1 bits"));
}

#[test]
fn int_input_shows_naf_with_subtraction() {
    let (code, stdout, _) = run(&["--no-color", "7"]);
    assert_eq!(code, 0);
    assert!(
        stdout.contains("NAF: +2^3 −2^0"),
        "subtraction missing:\n{}",
        stdout
    );
}

#[test]
fn array_input_ingests_loop_vector() {
    let (code, stdout, _) = run(&["--no-color", "[25, 3319]"]);
    assert_eq!(code, 0);
    assert!(stdout.contains("kind: array"));
    assert!(stdout.contains("2 elements"));
}

#[test]
fn malformed_array_exits_two() {
    let (code, _, stderr) = run(&["[1, dos]"]);
    assert_eq!(code, 2);
    assert!(stderr.contains("malformed array"));
}

#[test]
fn out_of_range_integer_exits_two() {
    let huge = "9".repeat(60);
    let (code, _, stderr) = run(&[&huge]);
    assert_eq!(code, 2);
    assert!(stderr.contains("out of i128 range"));
}

#[test]
fn negative_number_works_and_differs_from_positive() {
    let (_, neg, _) = run(&["--blid", "-5"]);
    let (_, pos, _) = run(&["--blid", "5"]);
    assert_ne!(neg, pos);
}

#[test]
fn walk_composes_with_int_input() {
    // --walk over the number 8 runs on its magnitude bits "1000".
    let (code, stdout, _) = run(&["--walk", "--no-color", "8"]);
    assert_eq!(code, 0);
    assert!(stdout.contains("steps 2"));
}

// ---------- compact + keyed BLID exchange ----------

#[test]
fn loop_blid_compact_exchange_is_one_line() {
    // The entire message to another implementation: 16 hex chars.
    let (code, stdout, _) = run(&["--loop", "--blid"]);
    assert_eq!(code, 0);
    assert_eq!(stdout.trim(), "ed4cd25fcbfab234");
    assert_eq!(stdout.lines().count(), 1);
}

#[test]
fn keyed_blid_converges_for_key_holders_and_differs_from_public() {
    let (_, public, _) = run(&["--loop", "--blid"]);
    let (_, keyed1, _) = run(&["--loop", "--blid", "--key", "k"]);
    let (_, keyed2, _) = run(&["--loop", "--blid", "--key", "k"]);
    let (_, other, _) = run(&["--loop", "--blid", "--key", "k2"]);
    assert_eq!(keyed1, keyed2, "same key must converge");
    assert_ne!(keyed1, public, "keyed must differ from public");
    assert_ne!(keyed1, other, "different keys must diverge");
}

#[test]
fn keyed_input_blid_works_for_all_kinds() {
    for input in ["8", "[25, 3319]", "0101", "Hi"] {
        let (c, keyed, _) = run(&["--blid", "--key", "s", input]);
        let (_, public, _) = run(&["--blid", input]);
        assert_eq!(c, 0);
        assert_ne!(keyed, public, "keyed==public for {:?}", input);
        assert_eq!(keyed.trim().len(), 16);
    }
}

#[test]
fn key_without_value_is_usage_error() {
    let (code, _, stderr) = run(&["--blid", "8", "--key"]);
    assert_eq!(code, 1);
    assert!(stderr.contains("--key requires a value"));
}

// ---------- concert (multi-bucket identity) ----------

#[test]
fn concert_joins_buckets_into_one_blid() {
    let (code, stdout, _) = run(&["--concert", "--blid", "0101 1010"]);
    assert_eq!(code, 0);
    assert_eq!(stdout.trim().len(), 16);
    assert!(stdout.trim().chars().all(|c| c.is_ascii_hexdigit()));
}

#[test]
fn concert_order_changes_identity() {
    let (_, ab, _) = run(&["--concert", "--blid", "0101 1010"]);
    let (_, ba, _) = run(&["--concert", "--blid", "1010 0101"]);
    assert_ne!(ab, ba);
}

#[test]
fn concert_ratio_buckets_are_dimension_invariant() {
    // 1/2 and 2/4 reduce to the same identity — the concert converges.
    let (_, half, _) = run(&["--concert", "--blid", "1/2 11"]);
    let (_, twoquarters, _) = run(&["--concert", "--blid", "2/4 11"]);
    assert_eq!(half, twoquarters, "scale leaked into concert identity");
}

#[test]
fn concert_keyed_differs_from_public() {
    let (_, public, _) = run(&["--concert", "--blid", "0101 1010"]);
    let (_, keyed, _) = run(&["--concert", "--blid", "--key", "s", "0101 1010"]);
    assert_ne!(public, keyed);
}

#[test]
fn concert_rejects_bad_ratio() {
    let (code, _, stderr) = run(&["--concert", "1/0 11"]);
    assert_eq!(code, 2);
    assert!(stderr.contains("zero denominator"));
}
