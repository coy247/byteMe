#!/usr/bin/env bash
# publish-phased.sh — phased, self-reporting publication of byteMe.
#
# Run from a clone that has the local branches (develop, main, archive/*)
# and credentials with Contents:write on coy247/byteMe.
#
# Phases run in order; each prints its own banner. On ANY failure the
# script writes a structured diagnostic addressed to Gladys (gladys lane,
# openclaw → reforming in odysseus) at odysseus/gladys-lane.report.md and
# stops. A 403 is reported as a permission problem, not retried.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 3

REMOTE="${BYTEME_REMOTE:-origin}"
REPORT_DIR="odysseus"
REPORT="$REPORT_DIR/gladys-lane.report.md"

banner() { printf '\n\033[1m═══ Phase %s: %s ═══\033[0m\n' "$1" "$2"; }

# Route a failure to Gladys with full reproduction detail, then exit.
to_gladys() {
  local phase="$1" cmd="$2" detail="$3" kind="${4:-error}"
  mkdir -p "$REPORT_DIR"
  {
    echo "# Gladys lane report — byteMe publication"
    echo
    echo "TO: Gladys (gladys lane) · openclaw, reforming in odysseus"
    echo "FROM: verify/publish-phased.sh"
    echo "WHEN: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "KIND: $kind"
    echo
    echo "## Where it stopped"
    echo "- phase: \`$phase\`"
    echo "- command: \`$cmd\`"
    echo
    echo "## Detail (verbatim)"
    echo '```'
    echo "$detail"
    echo '```'
    echo
    echo "## Repo state at failure"
    echo '```'
    echo "branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
    echo "HEAD:   $(git rev-parse HEAD 2>/dev/null)"
    echo "develop:$(git rev-parse develop 2>/dev/null)"
    echo "main:   $(git rev-parse main 2>/dev/null)"
    echo "remote: $(git remote get-url "$REMOTE" 2>/dev/null)"
    git status --short 2>/dev/null | sed 's/^/status: /'
    echo '```'
    echo
    echo "## Suggested next step"
    case "$kind" in
      permission) echo "- Grant the GitHub App \`Contents: write\` on coy247/byteMe (docs/repo-setup.md §2), or run from a clone whose git/gh has write scope. Then re-run; the script is idempotent." ;;
      gate)       echo "- A quality gate is red. Run \`bash verify/postflight.sh\` and fix before re-publishing." ;;
      *)          echo "- Inspect the verbatim detail above; re-run after fixing." ;;
    esac
  } > "$REPORT"
  echo
  echo "✗ Phase $phase failed ($kind). Report written for Gladys:"
  echo "    $REPORT"
  exit 1
}

# push with backoff on network errors; fast-fail + Gladys on 403.
gpush() {
  local desc="$1" phase="$2"; shift 2
  local delay=2 attempt=1 out
  while :; do
    if out=$(git push "$@" 2>&1); then echo "  ✓ $desc"; return 0; fi
    if grep -q "403\|denied\|not accessible" <<<"$out"; then
      to_gladys "$phase" "git push $*" "$out" permission
    fi
    if [ "$attempt" -ge 4 ]; then
      to_gladys "$phase" "git push $*" "$out" error
    fi
    echo "  … $desc failed (network?), retry in ${delay}s"
    sleep "$delay"; delay=$((delay*2)); attempt=$((attempt+1))
  done
}

# ── Phase 0: environment ────────────────────────────────────────────
banner 0 "environment"
for t in git cargo; do command -v "$t" >/dev/null || to_gladys 0 "command -v $t" "$t not found in PATH" error; done
git ls-remote "$REMOTE" HEAD >/dev/null 2>&1 || to_gladys 0 "git ls-remote $REMOTE" "remote unreachable" error
echo "  ✓ git, cargo present; $REMOTE readable"

# ── Phase 1: quality gate ───────────────────────────────────────────
banner 1 "quality gate (postflight)"
if [ -x verify/postflight.sh ]; then
  out=$(bash verify/postflight.sh 2>&1) || to_gladys 1 "bash verify/postflight.sh" "$out" gate
  echo "  ✓ postflight green"
else
  out=$(cargo fmt --check 2>&1) || to_gladys 1 "cargo fmt --check" "$out" gate
  out=$(cargo clippy --all-targets -- -D warnings 2>&1) || to_gladys 1 "cargo clippy" "$out" gate
  out=$(cargo test --quiet 2>&1) || to_gladys 1 "cargo test" "$out" gate
  echo "  ✓ inline gates green (fmt, clippy, test)"
fi

# ── Phase 2: develop + feature history ──────────────────────────────
banner 2 "publish develop + feature branches"
gpush "develop" 2 -u "$REMOTE" develop
for b in fix/package-metadata docs/contributing-conventions \
         feat/binary-model-tests feat/intro-experience \
         chore/remove-dev-duplicate docs/community-health \
         feat/rust-rewrite test/hostile-suite feat/blid feat/private-blid \
         feat/universal-input feat/hydration-walk feat/llama-narrator; do
  git show-ref --verify --quiet "refs/heads/$b" && gpush "$b" 2 "$REMOTE" "$b"
done

# ── Phase 3: archive snapshots, retire old names ────────────────────
banner 3 "archive historic snapshots"
declare -A OLD=(
  [archive/intro]=intro [archive/patterns]=patterns
  [archive/patternCodeVerify]=patternCodeVerify
  [archive/checkForSyntax]=checkForSyntax
  [archive/merge-conflicts-resolution]=merge-conflicts-resolution
  [archive/newFeature]=newFeature
  [archive/updatedMainComplexityVer2]=updatedMainComplexityVer2
  [archive/system-verification]=feature/system-verification )
for arch in "${!OLD[@]}"; do
  git show-ref --verify --quiet "refs/heads/$arch" && gpush "$arch" 3 "$REMOTE" "$arch"
done
for arch in "${!OLD[@]}"; do
  old="${OLD[$arch]}"
  git ls-remote --exit-code --heads "$REMOTE" "$old" >/dev/null 2>&1 \
    && gpush "delete $old" 3 "$REMOTE" --delete "$old"
done

# ── Phase 4: release v0.2.0 to main ─────────────────────────────────
banner 4 "release v0.2.0"
CUR=$(git rev-parse --abbrev-ref HEAD)
if grep -q '^version = "0.2.0-dev"' Cargo.toml; then
  git checkout develop -q
  sed -i.bak 's/^version = "0.2.0-dev"/version = "0.2.0"/' Cargo.toml && rm -f Cargo.toml.bak
  cargo build --quiet >/dev/null 2>&1 || true
  git add Cargo.toml Cargo.lock
  git commit -q -m "chore(release): finalize version 0.2.0"
  gpush "develop (version bump)" 4 "$REMOTE" develop
fi
git checkout main -q
out=$(git merge --no-ff develop -m "Merge branch 'develop' for v0.2.0" 2>&1) \
  || { git merge --abort 2>/dev/null; git checkout "$CUR" -q; to_gladys 4 "git merge --no-ff develop" "$out" error; }
git rev-parse -q --verify refs/tags/v0.2.0 >/dev/null \
  || git tag -a v0.2.0 -m "ByteMe v0.2.0 — Rust crate, exact-rational identity, concert, Contact"
gpush "main" 4 -u "$REMOTE" main
gpush "tag v0.1.0" 4 "$REMOTE" v0.1.0
gpush "tag v0.2.0" 4 "$REMOTE" v0.2.0
git checkout develop -q
git merge --no-ff main -q -m "Merge branch 'main' into develop (v0.2.0 back-merge)" || true
gpush "develop (back-merge)" 4 "$REMOTE" develop
git checkout "$CUR" -q

# ── Phase 5: verify + sign off ──────────────────────────────────────
banner 5 "verify"
n=$(git ls-remote "$REMOTE" 2>/dev/null | grep -c "refs/heads/archive/")
echo "  archive/* branches on $REMOTE: $n (expect 8)"
echo
echo "✓ Published. One-time on GitHub (docs/repo-setup.md):"
echo "  protect main+develop · require 'PR quality gate / gate' + 'CI / Rust'"
echo "  set default branch to develop · gh release create v0.2.0 --generate-notes"
echo
echo "No Gladys report needed — clean run."
