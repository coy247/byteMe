# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-11

Rust rewrite. The Node.js implementation that shipped in `v0.1.0` is
preserved under `legacy/` for reference and historical reproducibility.

### Added

- **Rust crate** at the repository root (`Cargo.toml`, `src/`): a single
  static binary `byteme` with no runtime dependencies.
- **Library API** (`byteme::{binary, encode, metrics, patterns, output}`)
  for embedding the analyzer in other Rust programs.
- **Formal CLI output**: Unicode-bordered table with intentional color,
  one-line summary after the table.
- **`--verbose`**: per-metric plain-language explanations for learners.
- **`--json`**: stable machine-readable output (auto-disables color).
- **`--retro`**: opt-in AOL-era boot sequence — Matrix rain, fake BIOS,
  Windows 95 / Netscape Navigator / WordPerfect / Internet Explorer
  loading gags — port of `legacy/src/intro.js`.
- **`--demo`**: built-in fixture set, useful with `--retro`.
- **29 Rust unit tests** (`cargo test`) covering binary validation,
  entropy, run-length analysis, pattern classification, encoding, and
  CLI argument parsing.
- **CI now runs**: `cargo fmt --check`, `cargo clippy -D warnings`,
  `cargo test`, `cargo build --release`, plus a legacy-JS smoke job.

### Changed

- The canonical implementation is now Rust. Use `cargo install --path .`
  or `cargo run --release -- <input>` instead of `npm start`.
- The Node.js code, mocha tests, `package.json`, `package-lock.json`,
  `run.js` moved to `legacy/`. The behavior contract documented there
  (e.g. all-ones returns `f64::INFINITY` ratio) is honored by the Rust
  port verbatim.

### Removed

- The TypeScript exploration branch (`feature/typescript-conversion`)
  is abandoned. The decision to use Rust supersedes it. The branch is
  preserved as `archive/typescript-exploration` for the record.

[0.2.0]: https://github.com/coy247/byteMe/releases/tag/v0.2.0

## [0.1.0] - 2026-06-11

First disciplined release. Everything before this tag is the project's
learning-era history, preserved deliberately — see
[docs/git-workflow.md](docs/git-workflow.md) for why.

### Added

- Working binary pattern analyzer with MVC structure (`npm start "<binary>"`)
- **Retro AOL-era boot experience** (`npm run intro`): Matrix rain, fake BIOS
  boot, Windows 95 / Netscape Navigator loading-bar gags, ASCII banner —
  recovered from the `intro` archive snapshot (`45ffc69`)
- BinaryModel unit tests (mocha + chai, 8 assertions) and a real `npm test`
- GitHub Actions CI: node 22, syntax check, test suite on push/PR to
  `main`/`develop`
- CONTRIBUTING.md with gitflow-lite branching model and Conventional Commits
- PR template (including a "what this PR does NOT cover" section), issue
  templates, code of conduct, dependabot config
- `.gitattributes`, `.editorconfig`, `.prettierrc`

### Fixed

- `.gitignore` no longer contradicts tracked files (`archive/`, `*.json`
  global ignore that matched `package.json` itself, lockfile rules)
- `package.json`: honest `0.1.0` version, removed `path`/`webcrypto`
  pseudo-dependencies (both are Node built-ins), license field matches the
  Apache-2.0 LICENSE, test script no longer points at a nonexistent runner

### Removed

- `dev/byte-me/` duplicate parallel implementation (10 files; canonical code
  lives in `src/`)
- Stale `pnpm-lock.yaml` (replaced by tracked npm `package-lock.json`)

[0.1.0]: https://github.com/coy247/byteMe/releases/tag/v0.1.0
