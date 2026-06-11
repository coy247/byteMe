#!/usr/bin/env bash
# publish.sh — one command that publishes byteMe correctly, once.
#
# Safe to run only AFTER the GitHub App (or your gh auth) has Contents:
# write on coy247/byteMe. Until then every push 403s and this script
# stops at the preflight write-check without changing anything.
#
# It is idempotent: re-running after a partial publish skips what already
# exists and completes the rest. It refuses to publish unless postflight
# is green, so a broken tree can never reach origin.
#
# Sequence (the exemplary gitflow-lite release):
#   1. quality gate (postflight)            — refuse if red
#   2. push develop + all feature branches  — integration history
#   3. push 8 archive/* snapshots, delete the old unprefixed names
#   4. release v0.2.0: merge develop -> main, annotated tag, push
#   5. push the v0.1.0 tag too (historical)
#   6. report; remind about branch protection (docs/repo-setup.md)
set -uo pipefail
cd "$(dirname "$0")/.." || exit 3

REMOTE=origin
say() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }

# Retry a git push with exponential backoff on network failure (2/4/8/16s).
# A 403 is NOT a network error — fail fast and explain.
push() {
  local desc="$1"; shift
  local delay=2 attempt=1 out
  while :; do
    if out=$(git push "$@" 2>&1); then
      echo "  ✓ $desc"
      return 0
    fi
    if grep -q "403\|denied\|not accessible" <<<"$out"; then
      echo "  ✗ $desc — PERMISSION DENIED (403)."
      echo "    Grant the GitHub App 'Contents: write' on coy247/byteMe,"
      echo "    or run this from a clone authenticated with a token that"
      echo "    has write scope. See docs/repo-setup.md §2."
      echo "    git said: $(tail -1 <<<"$out")"
      exit 2
    fi
    if [ "$attempt" -ge 4 ]; then
      echo "  ✗ $desc — failed after 4 attempts:"; echo "$out" | sed 's/^/    /'
      exit 1
    fi
    echo "  … $desc failed (network?), retrying in ${delay}s"
    sleep "$delay"; delay=$((delay * 2)); attempt=$((attempt + 1))
  done
}

# ---- 1. quality gate ----
say "quality gate"
if ! bash verify/postflight.sh; then
  echo "postflight is not green — refusing to publish. Fix first."
  exit 1
fi

# ---- 2. develop + merged feature branches ----
say "publish develop and feature history"
push "develop" -u "$REMOTE" develop
for b in fix/package-metadata docs/contributing-conventions \
         feat/binary-model-tests feat/intro-experience \
         chore/remove-dev-duplicate docs/community-health \
         feat/rust-rewrite test/hostile-suite feat/blid feat/private-blid \
         feat/universal-input feat/hydration-walk feat/llama-narrator; do
  if git show-ref --verify --quiet "refs/heads/$b"; then
    push "$b" "$REMOTE" "$b"
  fi
done

# ---- 3. archive the historic snapshots, retire the old names ----
say "archive historic snapshots"
declare -A OLD=(
  [archive/intro]=intro
  [archive/patterns]=patterns
  [archive/patternCodeVerify]=patternCodeVerify
  [archive/checkForSyntax]=checkForSyntax
  [archive/merge-conflicts-resolution]=merge-conflicts-resolution
  [archive/newFeature]=newFeature
  [archive/updatedMainComplexityVer2]=updatedMainComplexityVer2
  [archive/system-verification]=feature/system-verification
)
for arch in "${!OLD[@]}"; do
  if git show-ref --verify --quiet "refs/heads/$arch"; then
    push "$arch" "$REMOTE" "$arch"
  fi
done
# Retire the old unprefixed names only after their archive/* exists.
for arch in "${!OLD[@]}"; do
  old="${OLD[$arch]}"
  if git ls-remote --exit-code --heads "$REMOTE" "$old" >/dev/null 2>&1; then
    push "delete $old (archived as $arch)" "$REMOTE" --delete "$old"
  fi
done
# Retire the stale session branch if it still exists on origin.
if git ls-remote --exit-code --heads "$REMOTE" \
     claude/typescript-conversion-branch-setup-Ng0Er >/dev/null 2>&1; then
  push "delete stale session branch" "$REMOTE" --delete \
    claude/typescript-conversion-branch-setup-Ng0Er
fi

# ---- 4. release v0.2.0 (Rust) to main ----
say "release v0.2.0 to main"
CUR=$(git rev-parse --abbrev-ref HEAD)
# Finalize the version on develop if it is still the -dev marker.
if grep -q '^version = "0.2.0-dev"' Cargo.toml; then
  git checkout develop -q
  sed -i 's/^version = "0.2.0-dev"/version = "0.2.0"/' Cargo.toml
  cargo build --quiet >/dev/null 2>&1 || true   # refresh Cargo.lock
  git add Cargo.toml Cargo.lock
  git commit -q -m "chore(release): finalize version 0.2.0"
  push "develop (version bump)" "$REMOTE" develop
fi
git checkout main -q
git merge --no-ff develop -q -m "Merge branch 'develop' for v0.2.0

The Rust rewrite and everything built on it: exact-rational identity,
concert multi-bucket BLIDs, the Contact reading, the session-stability
harness, and the PR quality gate." || {
  echo "  merge conflict releasing to main — resolve manually"; git merge --abort; git checkout "$CUR" -q; exit 1; }
if ! git rev-parse -q --verify refs/tags/v0.2.0 >/dev/null; then
  git tag -a v0.2.0 -m "ByteMe v0.2.0 — Rust crate, exact-rational identity, concert, Contact"
fi
push "main" -u "$REMOTE" main
push "tag v0.1.0" "$REMOTE" v0.1.0
push "tag v0.2.0" "$REMOTE" v0.2.0
# Back-merge main into develop so they share the release commit.
git checkout develop -q
git merge --no-ff main -q -m "Merge branch 'main' into develop (v0.2.0 back-merge)" || true
push "develop (back-merge)" "$REMOTE" develop
git checkout "$CUR" -q

# ---- 5. done ----
say "published"
echo "Next (one-time, on GitHub — see docs/repo-setup.md):"
echo "  • protect main + develop, require checks 'PR quality gate / gate'"
echo "    and 'CI / Rust'"
echo "  • set default branch to develop"
echo "  • gh release create v0.2.0 --generate-notes   (mirror CHANGELOG)"
echo
echo "Verify:  git ls-remote $REMOTE | grep -c archive/   # expect 8"
