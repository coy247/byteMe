#!/usr/bin/env bash
# preflight.sh — establish a reproducible, stable session baseline.
#
# Run at the START of a session. It proves the toolchain is present, the
# gates are green, and records a content-addressed fingerprint of the
# working tree (the "session-start BLID"). postflight.sh re-checks against
# this fingerprint so any session can prove it ended in a known-good,
# reproducible state — no human bookkeeping.
#
# Exit 0 = stable baseline established. Non-zero = something is already
# wrong; fix before working. Idempotent and side-effect-free except for
# writing .session/state.env.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 3

STATE_DIR=".session"
mkdir -p "$STATE_DIR"
fail=0
say() { printf '%s %s\n' "$1" "$2"; }

# --- toolchain presence (the obvious 403-class checks, generalized) ---
need() {
  if command -v "$1" >/dev/null 2>&1; then
    say "✓" "$1 ($($2 2>&1 | head -1))"
  else
    say "✗" "$1 MISSING"; fail=1
  fi
}
echo "── toolchain ──"
need cargo "cargo --version"
need rustc "rustc --version"
# At least one JS runtime for the cross-language gate; deno preferred.
if command -v deno >/dev/null 2>&1; then say "✓" "deno ($(deno --version | head -1))"
elif command -v node >/dev/null 2>&1; then say "✓" "node ($(node --version)) [deno preferred]"
else say "✗" "no deno or node — cross-language gate cannot run"; fail=1; fi

# --- remote write reachability (diagnose 403 early, never block on it) ---
echo "── remote ──"
if git ls-remote origin HEAD >/dev/null 2>&1; then
  say "✓" "origin readable"
  # A dry-run push reveals write scope without mutating anything.
  if git push --dry-run origin HEAD:refs/heads/__preflight_probe__ >/dev/null 2>&1; then
    say "✓" "origin writable"
    echo "REMOTE_WRITABLE=1" > "$STATE_DIR/remote.env"
  else
    say "⚠" "origin NOT writable (403-class) — work stays local; see runbook"
    echo "REMOTE_WRITABLE=0" > "$STATE_DIR/remote.env"
  fi
else
  say "✗" "origin unreachable"; fail=1
fi

# --- gates ---
echo "── gates ──"
run_gate() {
  if "$@" >/tmp/preflight_gate.log 2>&1; then say "✓" "$*"; else
    say "✗" "$* — see /tmp/preflight_gate.log"; fail=1; fi
}
run_gate cargo fmt --check
run_gate cargo clippy --all-targets -- -D warnings
run_gate cargo test --quiet
if command -v deno >/dev/null 2>&1; then
  run_gate deno run verify/crosscheck.mjs
elif command -v node >/dev/null 2>&1; then
  run_gate node verify/crosscheck.mjs
fi

# --- session-start fingerprint (content-addressed, reproducible) ---
echo "── fingerprint ──"
# Hash the tracked source tree only (deterministic; ignores build output).
TREE_HASH=$(git ls-files -s -- 'src/*' 'tests/*' 'verify/*' Cargo.toml \
  | git hash-object --stdin 2>/dev/null || \
  git ls-files -s -- src tests verify Cargo.toml | sha256sum | cut -d' ' -f1)
HEAD_SHA=$(git rev-parse HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
{
  echo "SESSION_START=$TS"
  echo "BRANCH=$BRANCH"
  echo "HEAD_SHA=$HEAD_SHA"
  echo "TREE_HASH=$TREE_HASH"
} > "$STATE_DIR/state.env"
say "•" "branch $BRANCH @ ${HEAD_SHA:0:12}"
say "•" "tree fingerprint ${TREE_HASH:0:16}"

echo
if [ "$fail" -eq 0 ]; then
  echo "PREFLIGHT OK — stable baseline established ($TS)"
  exit 0
else
  echo "PREFLIGHT FAILED — resolve the ✗ items before working"
  exit 1
fi
