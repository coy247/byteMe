# Publishing runbook — publish the rebuilt byteMe

> **One command:** once the GitHub App has `Contents: write` (see
> `docs/repo-setup.md` §2), run `bash verify/publish.sh`. It runs the
> quality gate, then publishes everything below in order, idempotently,
> with retries — and stops safely at the 403 if the permission isn't
> granted yet. The manual steps below are the same sequence, by hand.


Run from this clone (or any clone with these local branches) once write
access to coy247/byteMe is restored. Total time: ~3 minutes.

## 0. Preflight

```bash
git fetch origin --prune
git log --oneline -1 main        # expect: 5815a2b Merge branch 'release/0.1.0'
git tag -l                       # expect: v0.1.0
npx tsc --noEmit && npm test     # expect: exit 0, 8 passing (on feature/typescript-conversion)
```

## 1. Publish the trunk

```bash
git push -u origin main          # fast-forwards origin/main 094cb20 → 5815a2b
git push -u origin develop
git push origin v0.1.0
```

## 2. Publish the merged feature branches (network-graph visibility)

```bash
git push -u origin fix/package-metadata docs/contributing-conventions \
  feat/binary-model-tests feat/intro-experience chore/remove-dev-duplicate \
  docs/community-health release/0.1.0
```

Optional (gitflow discipline says delete after merge — topology survives
in the merge commits):

```bash
git push origin --delete fix/package-metadata docs/contributing-conventions \
  feat/binary-model-tests feat/intro-experience chore/remove-dev-duplicate \
  docs/community-health release/0.1.0
```

## 3. Archive-rename the historic snapshots

```bash
git push origin archive/intro archive/patterns archive/patternCodeVerify \
  archive/checkForSyntax archive/merge-conflicts-resolution \
  archive/newFeature archive/updatedMainComplexityVer2 \
  archive/system-verification

git push origin --delete intro patterns patternCodeVerify checkForSyntax \
  merge-conflicts-resolution newFeature updatedMainComplexityVer2 \
  feature/system-verification
```

## 4. The showcase PR (Rust rewrite, the real artifact)

```bash
git push -u origin feat/rust-rewrite
gh pr create --base develop --head feat/rust-rewrite \
  --title "feat(rust): rewrite byteme as a Rust crate; preserve JS as legacy/" \
  --body-file - <<'EOF'
## What
Replaces the JS implementation with a Rust crate. Single static binary,
no runtime dependencies. Library API + CLI with formal/verbose/json/retro
modes. The JS code stays under legacy/ as historical reference.

## Why
TypeScript was an incremental wrap; Rust is the durable upgrade — type
safety from day one, single-binary distribution, performance, and a
forcing function for honest API design.

## How verified
- cargo fmt --check → exit 0
- cargo clippy --all-targets -D warnings → exit 0
- cargo test → 29 passing
- cargo build --release → ok
- cd legacy && npm test → 8 passing (legacy smoke survives)

## What this PR does NOT cover
- Retro intro's SIGINT cleanup is best-effort (no ctrlc crate).
- Pattern model.json seed (used by legacy) not yet ported to Rust.
- No publish to crates.io (binary distribution via `cargo install --path .`).
EOF
```

Wait for CI green, then merge with a merge commit (preserve topology):

```bash
gh pr merge --merge --delete-branch
```

## 4b. Archive the abandoned TS exploration

```bash
# The feature/typescript-conversion branch is preserved as a record of
# the path not taken. It does not get merged.
git push origin feature/typescript-conversion:refs/heads/archive/typescript-exploration
git push origin --delete feature/typescript-conversion
```

## 5. Release v0.2.0 (after PR merges)

```bash
git checkout develop && git pull
git checkout -b release/0.2.0
# Cargo.toml version is already 0.2.0-dev; bump to 0.2.0:
sed -i 's/^version = "0.2.0-dev"/version = "0.2.0"/' Cargo.toml
cargo build  # refresh Cargo.lock
# CHANGELOG.md already has the [0.2.0] section from the rewrite commit
git add Cargo.toml Cargo.lock
git commit -m "chore(release): prepare v0.2.0"
git checkout main && git merge --no-ff release/0.2.0
git tag -a v0.2.0 -m "ByteMe v0.2.0 — Rust rewrite"
git checkout develop && git merge --no-ff main
git push origin main develop v0.2.0
git push origin --delete release/0.2.0 2>/dev/null || true
```

## 6. Close PR #1 (dependabot pbkdf2)

```bash
gh pr comment 1 --body "Closing: the repo was restructured (see v0.1.0).
pnpm-lock.yaml this PR patched no longer exists — npm package-lock.json
replaced it. Dependabot config now tracks npm weekly and will re-raise
anything still relevant."
gh pr close 1
```

## 7. GitHub Releases (optional polish)

```bash
gh release create v0.1.0 --title "ByteMe v0.1.0" --generate-notes
gh release create v0.2.0 --title "ByteMe v0.2.0" --generate-notes  # after step 5
```

## Verification after publish

```bash
git ls-remote origin | grep -c archive/        # expect 8
gh pr list --state merged                       # expect the TS PR
gh run list --limit 3                           # expect green CI
```
