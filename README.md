# ByteMe 🔍

[![CI](https://github.com/coy247/byteMe/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/coy247/byteMe/actions/workflows/ci.yml)

> Empowering data exploration through binary analysis — formal output by
> default, AOL-era retro mode on demand.

A playful but disciplined tool for analyzing binary string patterns. Single
static binary, no runtime dependencies, optional retro intro because
software should occasionally be fun.

## Install & run

```bash
cargo install --path .       # builds a single `byteme` binary
byteme "01001000 01101001"   # formal analysis output
```

Don't want to install globally? `cargo run --release -- "01001000"`.

## Two faces, on purpose

### Formal mode (default)

```
$ byteme "01001000 01101001 00100001"
╔══════════════════════════════════════════════════════════╗
║ ByteMe Analysis                                          ║
╠══════════════════════════════════════════════════════════╣
║ Input            01001000 01101001 00100001              ║
║ Binary           010010000110100100100001                ║
║ Length           24 bits                                 ║
╟──────────────────────────────────────────────────────────╢
║ Ones / Zeros     8 / 16                                  ║
║ Ratio (1:0)      0.500                                   ║
║ Entropy          0.9183 bits                             ║
║ Longest run      4 bits                                  ║
║ Distinct runs    14                                      ║
║ Alternating?     no                                      ║
║ Burstiness       0.1250                                  ║
║ Classification   mixed                                   ║
╚══════════════════════════════════════════════════════════╝

→ useful input, classification: mixed, entropy 0.92
```

### Retro mode (opt-in, decorative)

```bash
byteme --retro "01001000 01101001"
```

A nod to 1990–1992: Matrix rain, fake BIOS boot, a Windows 95 / Netscape
Navigator / WordPerfect / Internet Explorer loading-bar gag, ASCII banner.
Activated explicitly, never by default — the retro stuff is decoration,
the math is the point.

## All the modes

| Flag | Effect |
|---|---|
| *(none)* | Formal Unicode table + one-line summary |
| `--verbose`, `-v` | Adds plain-language explanations of every metric |
| `--json` | Machine-readable JSON (pipe to `jq`, etc.) |
| `--blid` | Print only the content-addressed ID of the input's bits |
| `--loop` | Import the embedded interdimensional-loop study set |
| `--retro` | Plays the AOL-era intro before analysis |
| `--demo` | Run against a built-in fixture set |
| `--no-color` | Disable ANSI (auto-off when piping to a file) |
| `--help`, `-h` | Full usage |
| `--version`, `-V` | Print version |

## BLIDs — content-addressed results

Every analysis carries a **BLID**: a versioned sha256 over the normalized
bits (`byteme/blid/v1`). Because every metric is a pure function of those
bits, the BLID identifies the complete analysis. The key property is
**convergence**: two independent routes to the same bits produce the same
BLID —

```
$ byteme --blid Hi
a2fc4a037c913df5
$ byteme --blid 0100100001101001
a2fc4a037c913df5
```

Use BLIDs to deduplicate analysis receipts, key caches, link results in
work-state journals, and verify that independently produced results agree
without exchanging payloads. The SHA-256 implementation is in-crate
(zero dependencies) and gated by NIST FIPS 180-4 vectors — if those tests
fail, the build fails.

## The interdimensional loop

`byteme --loop` imports the embedded booLang-hardening study set — 32
`[a, b]` density observations with index-aligned scalars — and reports
density, Bernoulli entropy, weighted score, and a BLID per entry plus a
collective run BLID. Malformed rows and length mismatches are hard errors:
partial imports are how stale counters survive five weeks.

## What it measures

| Metric | What it tells you |
|---|---|
| **Entropy** | How unpredictable the bits are (0 = constant, 1 = maximum) |
| **Longest run** | Length of the biggest streak of identical bits |
| **Distinct runs** | How many times the bit flips, plus one |
| **Alternating** | True iff every adjacent pair of bits differs |
| **Burstiness** | How clumped vs. evenly distributed |
| **Classification** | `alternating` / `run-based` / `mixed` (drives the predictor) |

Run with `--verbose` and these come with explanations inline.

## Educational uses

- **Cryptography 101**: visualize what high vs. low entropy actually looks
  like; PRNG output should look mixed, not run-based.
- **Information theory**: see Shannon entropy computed on real strings.
- **Coding bootcamps**: text auto-encodes to bits, so `byteme Hi!` shows
  the UTF-8 encoding directly.
- **Pattern recognition**: classify random vs. periodic vs. burst-y data
  at a glance.

## Project structure

```
├── src/             Rust crate (the canonical implementation)
├── legacy/          JavaScript implementation as shipped in v0.1.0
├── archive/         Historical reference utility files
├── docs/            git-workflow.md (Mermaid diagram), publishing-runbook.md
└── .github/         CI workflow, PR + issue templates, dependabot
```

The `legacy/` JavaScript is preserved as a reference: same behavior
contract, same retro intro, but Node-based. It still passes its mocha
suite. See [legacy/README.md](legacy/README.md).

## Contributing

This repo doubles as a demonstration of disciplined git practice — see
[CONTRIBUTING.md](CONTRIBUTING.md) for the gitflow-lite branching model and
the Conventional Commits convention, and
[docs/git-workflow.md](docs/git-workflow.md) for the full workflow diagram.

## License

Licensed under [Apache 2.0](LICENSE).

## Binary playground 🎮

Try these in either mode:

```
byteme "01001000 01101001 00100001"        # "Hi!"
byteme --retro "11010111 01010101 01010101"
byteme --verbose 11110000                   # high burstiness, run-based
byteme --json 10101010 | jq .               # pipe-safe
byteme --demo                               # built-in fixtures
```
