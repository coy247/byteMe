# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
