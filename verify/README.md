# Session stability harness

Three scripts make every working session self-certifying and reproducible.

| Script | When | Proves |
|---|---|---|
| `preflight.sh` | session start | toolchain present, gates green, records a content-addressed tree fingerprint (the session baseline) |
| `postflight.sh` | session end / after each change | gates still green, tree/​HEAD delta vs baseline, working tree clean, durability risk surfaced |
| `crosscheck.mjs` | invoked by the gates | the Deno/Node route converges with the Rust route (cross-language BLID proof) |

## Usage

```bash
bash verify/preflight.sh      # exit 0 = stable baseline established
# ... work ...
bash verify/postflight.sh     # exit 0 = session ended reproducible & stable
```

State lives in `.session/` (gitignored). Nothing is mutated except that
directory.

## What the harness attacks automatically

- **403-class remote failures.** Preflight does a `git push --dry-run`
  and records `REMOTE_WRITABLE`. It never blocks on a 403 — it reports
  it and continues. Postflight then warns how many local commits are
  *not durable* (would die with a sandbox reset) and points at
  `docs/publishing-runbook.md`. This is the obvious failure the operator
  asked to attack without pausing: surfaced, quantified, never fatal.
- **Toolchain drift.** Missing cargo/rustc/deno is caught at the door.
- **Silent gate regressions.** fmt, clippy `-D warnings`, the full test
  suite, and the cross-language convergence gate all run both at start
  and end — a soft check masked by a pipe (a real bug found earlier in
  this project) cannot recur, because the scripts assert exit codes.

## Reproducibility model

The tree fingerprint is `git hash-object` over the tracked source set
(`src/`, `tests/`, `verify/`, `Cargo.toml`). Identical inputs → identical
fingerprint on any machine, so two independent runs of preflight on the
same commit produce the same baseline — the content-addressed property
applied to the session itself.
