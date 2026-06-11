//! Cross-language convergence, executed automatically — the user does
//! nothing. `verify/crosscheck.mjs` re-implements the BLID recipe in
//! JavaScript over Node's OpenSSL bindings (zero shared code with the
//! hand-rolled Rust sha256/hmac) and re-derives every pinned BLID from
//! scratch. This test runs it and additionally compares the live Rust
//! values against the script's expectations, so neither side can drift
//! silently.

use byteme::{blid::Blid, canon, interloop};
use std::process::Command;

#[test]
fn javascript_route_converges_with_rust_route() {
    let script = concat!(env!("CARGO_MANIFEST_DIR"), "/verify/crosscheck.mjs");

    // Preferred runtime: Deno with ZERO permission flags — denied-by-
    // default sandboxing means the verification provably cannot touch
    // fs/net/env. Falls back to Node where Deno isn't installed.
    let out = Command::new("deno")
        .args(["run", script])
        .output()
        .or_else(|_| Command::new("node").arg(script).output())
        .expect(
            "deno or node is required for the cross-language gate \
             (both available on CI; deno preferred)",
        );
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        out.status.success(),
        "JS route diverged from Rust route:\n{}",
        stdout
    );
    assert!(stdout.contains("convergence proven: 7/7"), "{}", stdout);
}

#[test]
fn rust_live_values_match_the_pins_the_script_checks() {
    // Belt and suspenders: the same constants, asserted against the
    // LIVE Rust computation (not just the script's copy).
    let run = interloop::study_run();
    assert_eq!(run.run_blid_short, "55669eccbbfc4cfa");
    assert_eq!(&run.entries[0].blid_short, "5f5438b01b54d7e3");
    assert_eq!(&run.entries[27].blid_short, "61eb04895c108455");
    assert_eq!(&run.entries[31].blid_short, "5901987551030c70");
    assert_eq!(
        run.keyed_run_blid("nuestra-llave-secreta").short(),
        "c22d1336b7c62f38"
    );
    assert_eq!(
        canon::ingest("8").unwrap().blid().short(),
        "6979745b5e222ca3"
    );
    assert_eq!(
        Blid::of_binary(&byteme::encode::to_binary("Hi")).short(),
        "a2fc4a037c913df5"
    );
}
