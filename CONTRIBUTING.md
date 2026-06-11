# Contributing to ByteMe

Thanks for your interest in ByteMe! This document describes how work flows
through this repository. It exists so that the git history itself stays
legible — every branch, commit, and merge should tell a reviewer what
happened and why.

## Branching model (gitflow-lite)

```
main      ←  releases only, every commit on main is tagged
  ↑
develop   ←  integration branch, always buildable
  ↑
feature branches  ←  one feature per branch, short-lived
```

- **`main`** holds released code. It only receives merges from `develop`
  (via a release branch) and hotfixes. Every merge to `main` gets an
  annotated tag (`v0.1.0`, `v0.2.0`, …).
- **`develop`** is the integration branch. Feature branches merge here with
  `--no-ff` so the branch topology stays visible in history.
- **Feature branches** are named by type:
  - `feat/<slug>` — new functionality
  - `fix/<slug>` — bug fixes
  - `chore/<slug>` — maintenance, tooling
  - `docs/<slug>` — documentation only
  - `release/<version>` — release preparation
- **`archive/<name>`** branches are frozen historical snapshots from this
  project's early life. They are reference material — never merge them
  wholesale; cherry-pick or extract what you need and cite the source SHA
  in your commit message.

One feature per branch. If you find yourself fixing an unrelated bug on a
feature branch, stop and open a separate `fix/` branch.

## Commit messages (Conventional Commits)

This repo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <imperative subject>

<body: what changed and WHY — wrap at 72 chars>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`.

Good example:

```
fix(meta): align package metadata with actual project state

- version 1.0.0 → 0.1.0: honest pre-release semver for a project
  with no test coverage yet
```

Bad examples (all real, from this repo's early history — preserved as a
learning record): `updated readme`, `ran through asx models`,
`{commit_message}`.

The convention applies from `v0.1.0` onward. Earlier history is kept as-is:
rewriting published history is worse than owning it.

## Pull requests

- Target `develop`, never `main` directly.
- Fill in the PR template: what changed, why, and how you verified it.
- A PR description that only asserts is propaganda; one that also delimits
  what it does **not** cover is evidence. Say what you didn't test.
- CI must be green before merge.
- Merges use merge commits (`--no-ff`) to preserve branch topology.
- Delete the feature branch after merge.

## Running the project

```bash
# Rust (canonical, since v0.2.0)
cargo build --release
./target/release/byteme "01001000 01101001"   # formal analysis
./target/release/byteme --retro "Hi!"          # retro boot 🕹
cargo test                                     # all 29 tests

# Legacy JavaScript (still works, lives under legacy/)
cd legacy && npm install && npm test
```

## Required CI gates

Every PR must pass: `cargo fmt --check`, `cargo clippy --all-targets -D
warnings`, `cargo test --all-targets`, `cargo build --release`. The legacy
JS smoke job (`legacy/ npm test`) must also stay green.

## Signed commits

Encouraged but not required. If you sign, make sure your key is published
on your GitHub profile so the badge verifies.
