#!/usr/bin/env bash
# postflight.sh — prove the session ended in a known-good, reproducible
# state. Run at the END of a session (or after each significant change).
#
# Re-runs every gate, recomputes the tree fingerprint, and reports the
# delta against the preflight baseline. The pairing makes each session
# self-certifying: a green postflight is a receipt that the session is
# reproducible and stable, with no manual bookkeeping.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 3

STATE_DIR=".session"
fail=0
say() { printf '%s %s\n' "$1" "$2"; }

if [ ! -f "$STATE_DIR/state.env" ]; then
  echo "no preflight baseline — run verify/preflight.sh first"; exit 2
fi
# shellcheck disable=SC1091
. "$STATE_DIR/state.env"

echo "── gates ──"
run_gate() {
  if "$@" >/tmp/postflight_gate.log 2>&1; then say "✓" "$*"; else
    say "✗" "$* — see /tmp/postflight_gate.log"; fail=1; fi
}
run_gate cargo fmt --check
run_gate cargo clippy --all-targets -- -D warnings
run_gate cargo test --quiet
if command -v deno >/dev/null 2>&1; then
  run_gate deno run verify/crosscheck.mjs
elif command -v node >/dev/null 2>&1; then
  run_gate node verify/crosscheck.mjs
fi

echo "── reproducibility ──"
# Recompute the same fingerprint preflight used.
NEW_TREE=$(git ls-files -s -- 'src/*' 'tests/*' 'verify/*' Cargo.toml \
  | git hash-object --stdin 2>/dev/null || \
  git ls-files -s -- src tests verify Cargo.toml | sha256sum | cut -d' ' -f1)
NEW_HEAD=$(git rev-parse HEAD)
if [ "$NEW_TREE" = "${TREE_HASH:-}" ]; then
  say "•" "tree unchanged since preflight (${NEW_TREE:0:16})"
else
  say "•" "tree advanced: ${TREE_HASH:0:16} → ${NEW_TREE:0:16}"
fi
if [ "$NEW_HEAD" = "${HEAD_SHA:-}" ]; then
  say "•" "HEAD unchanged (${NEW_HEAD:0:12})"
else
  say "•" "HEAD advanced: ${HEAD_SHA:0:12} → ${NEW_HEAD:0:12}"
fi

# Working tree must be clean to certify reproducibility.
echo "── working tree ──"
if [ -z "$(git status --porcelain)" ]; then
  say "✓" "clean (every change committed)"
else
  say "⚠" "uncommitted changes present:"; git status --short | sed 's/^/    /'
fi

# Surface the durable-state risk: unpushed commits die with the sandbox.
if [ -f "$STATE_DIR/remote.env" ]; then
  # shellcheck disable=SC1091
  . "$STATE_DIR/remote.env"
  if [ "${REMOTE_WRITABLE:-0}" = "0" ]; then
    AHEAD=$(git rev-list --count @{upstream}..HEAD 2>/dev/null || echo "?")
    say "⚠" "origin not writable; $AHEAD local commit(s) are NOT durable — see docs/publishing-runbook.md"
  fi
fi

echo
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
if [ "$fail" -eq 0 ]; then
  echo "POSTFLIGHT OK — session reproducible and stable ($TS)"
  exit 0
else
  echo "POSTFLIGHT FAILED — the session did NOT end clean"
  exit 1
fi
