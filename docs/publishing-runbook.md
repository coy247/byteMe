# Publishing runbook — publish the rebuilt byteMe

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

## 4. The showcase PR (the one real PR artifact)

```bash
git push -u origin feature/typescript-conversion
gh pr create --base develop --head feature/typescript-conversion \
  --title "feat(ts): migrate codebase to TypeScript (incremental, @ts-nocheck pragma)" \
  --body-file - <<'EOF'
## What
File-level TypeScript migration: src/ and tests/ renamed to .ts via git mv,
lenient tsconfig, ts-node runtime, CI now type-checks.

## Why
Build infrastructure for incremental typing without behavior change.

## How verified
- npx tsc --noEmit → exit 0
- npm test → 8/8 passing under ts-node/register
- ts-node runs both the analyzer and the retro intro

## What this PR does NOT cover
No actual type coverage was added — every file carries @ts-nocheck.
MIGRATION.md documents the de-nocheck order. dev/ and archive/ excluded.
EOF
```

Wait for CI green, then merge with a merge commit (not squash — preserve
the rename commit):

```bash
gh pr merge --merge --delete-branch
```

## 5. Release v0.2.0 (after PR merges)

```bash
git checkout develop && git pull
git checkout -b release/0.2.0
# bump package.json version to 0.2.0, add CHANGELOG [0.2.0] entry:
#   Added: TypeScript build infrastructure (tsconfig, ts-node, typecheck CI)
#   Changed: runtime now executes via ts-node; mocha via ts-node/register
npm version 0.2.0 --no-git-tag-version
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): prepare v0.2.0"
git checkout main && git merge --no-ff release/0.2.0
git tag -a v0.2.0 -m "ByteMe v0.2.0 — TypeScript migration"
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
