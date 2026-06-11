# Repository setup — the exemplary configuration

byteMe is meant to demonstrate a correctly-run repository. Most of that
lives in the tree already (CI, templates, CODE_OF_CONDUCT, CONTRIBUTING,
the gitflow-lite model). This file is the one-time operator checklist for
the settings that can only be configured on GitHub itself.

Do these once after the first push. They make the automated quality gate
*binding* instead of merely informative.

## 1. Protect `main` and `develop`

GitHub → Settings → Branches → Add branch ruleset (or classic protection)
for `main` and `develop`:

- ☑ Require a pull request before merging
- ☑ Require status checks to pass → select **PR quality gate / gate**
  and **CI / Rust**
- ☑ Require branches to be up to date before merging
- ☑ Require conversation resolution before merging
- ☑ Include administrators (hold yourself to the same bar)
- For `main`: ☑ Require linear history (releases stay clean)

With this, no PR can merge unless `pr-quality.yml` (preflight +
postflight) and `ci.yml` are green. The gate is now load-bearing.

## 2. Grant the automation write scope

The PR responder posts a sticky verdict comment, so the workflow needs
`pull-requests: write` — already declared in `pr-quality.yml`. Confirm:

GitHub → Settings → Actions → General → Workflow permissions →
**Read and write permissions**.

(This is also the permission the local session's GitHub App is missing —
the `403 Resource not accessible by integration` on push. Granting the
app `Contents: write` on this repo is what unblocks automated pushes.)

## 3. Default branch

Set the default branch to `develop` (feature work targets it) and keep
`main` for tagged releases only.

## 4. Releases

Tags `v0.1.0` … are annotated. After pushing a tag, create a GitHub
Release from it (`gh release create vX.Y.Z --generate-notes`) so the
Releases page mirrors `CHANGELOG.md`.

## What is already automated (no setup needed)

- **Every PR is answered automatically** by `pr-quality.yml`: it runs
  `verify/preflight.sh` then `verify/postflight.sh` — the identical
  harness you run locally — and posts/updates one sticky comment with the
  verdict and the full captured output. Quality and reproducibility stay
  on autopilot.
- **CI** (`ci.yml`) runs fmt, clippy `-D warnings`, the test suite, the
  cross-language convergence gate, and a release build, plus the legacy
  JS smoke job.
- **Dependabot** opens weekly dependency PRs (which then go through the
  same quality gate).
