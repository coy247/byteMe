#!/usr/bin/env -S deno run
// Cross-language convergence check — the second, independent route.
//
// This script re-implements the byteme BLID recipe in JavaScript with
// ZERO shared code: the SHA-256/HMAC here come from the runtime's
// crypto (OpenSSL under Node, Rust ring/aws-lc under Deno), while the
// byteme crate hand-rolls FIPS 180-4. If all routes converge on the
// same BLIDs, the canonical recipe is reproducible across languages
// and machine-code paths — which is the whole claim.
//
// Preferred runtime: Deno, run with ZERO permission flags —
//
//   deno run verify/crosscheck.mjs
//
// Deno denies filesystem/network/env by default, so this verification
// is *provably* incapable of touching anything outside its own math.
// That sandboxing is itself part of the receipt. Node also works
// (`node verify/crosscheck.mjs`) as the fallback runtime.
//
// CI runs this on every push; no human does anything.

import { createHash, createHmac } from "node:crypto";
import { Buffer } from "node:buffer";

const DOMAIN = "byteme/blid/v1\n";

const sha256hex = (s) => createHash("sha256").update(s).digest("hex");
const blid = (record) => sha256hex(DOMAIN + record).slice(0, 16);
const blidKeyed = (key, record) =>
  createHmac("sha256", key).update(DOMAIN + record).digest("hex").slice(0, 16);

// Independent copy of the booLang-hardening study set (32 + 32).
const vectors = [
  [25, 3319], [51, 53], [1, 53], [2, 597], [105, 349], [152, 497],
  [172, 2403], [183, 677], [262, 473], [461, 1373], [706, 1033],
  [1012, 1809], [1270, 4491], [1347, 1387], [1356, 3097], [1611, 1681],
  [1697, 3431], [2078, 2961], [2806, 2883], [3443, 5463], [3497, 6117],
  [3925, 4809], [7076, 7257], [168091, 250000], [83, 353], [63, 100],
  [590, 1921], [3915, 9229], [7881, 86801], [937087, 1096491],
  [46423, 63041], [164674, 323067],
];
// Scalars as EXACT decimal strings — never floats. This is the v2 fix:
// "0.1" is exactly 1/10, not the lossy 0.1_f64. The value survives
// translation between languages because no float is ever formatted.
const scalars = [
  "-1977345647", "-1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",
  "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "0.1", "0.7",
  "0.8", "0.9113", "0.94", "3", "5.822", "128",
];

// Exact rational helpers — the dimension-invariant identity layer.
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b;
  while (b) { [a, b] = [b, a % b]; } return a; };
// Reduce a/b to lowest terms, denominator positive. Returns "num/den".
const reduceRatio = (a, b) => {
  let n = BigInt(a), d = BigInt(b);
  let g = gcd(n, d) || 1n;
  n /= g; d /= g;
  if (d < 0n) { n = -n; d = -d; }
  return `${n}/${d}`;
};
// Exact decimal string → "num/den" (no float).
const decimalToRatio = (s) => {
  s = s.trim();
  const neg = s.startsWith("-");
  const body = neg ? s.slice(1) : s.replace(/^\+/, "");
  const [int = "", frac = ""] = body.split(".");
  const digits = (int + frac).replace(/^0+(?=\d)/, "") || "0";
  const num = (neg ? "-" : "") + digits;
  const den = 10n ** BigInt(frac.length);
  return reduceRatio(BigInt(num), den);
};

// v2 entry record: integer-only, exact, dimension-invariant.
const entryRecord = (a, b, s) =>
  `study-entry/v2\n${reduceRatio(a, b)} ${decimalToRatio(s)}`;

const checks = [];
const expect = (name, got, want) => checks.push({ name, got, want, ok: got === want });

// 1. The study run BLID, recomputed from scratch (v2).
const entryBlidsFull = vectors.map(([a, b], i) =>
  sha256hex(DOMAIN + entryRecord(a, b, scalars[i]))
);
const runRecord = "study-run/v2\n" + entryBlidsFull.map((h) => h + "\n").join("");
expect("study run BLID", blid(runRecord), "ed4cd25fcbfab234");

// 2. Spot-check entry BLIDs (first, the 0.9113-scalar one, last).
expect("entry 0 BLID", entryBlidsFull[0].slice(0, 16), "bfbb0b24bd38998a");
expect("entry 27 BLID (scalar 0.9113)", entryBlidsFull[27].slice(0, 16), "f6c7ac5502994802");
expect("entry 31 BLID", entryBlidsFull[31].slice(0, 16), "56f094049c87410a");

// 3. The bit-string route: "Hi" → UTF-8 bits (unchanged across versions).
const toBits = (text) =>
  [...Buffer.from(text, "utf8")].map((b) => b.toString(2).padStart(8, "0")).join("");
expect("bits BLID (Hi)", blid(toBits("Hi")), "a2fc4a037c913df5");

// 4. The formula of eight: int canonical record (unchanged).
expect("int 8 BLID", blid("int/v1\n8"), "6979745b5e222ca3");

// 5. Keyed exchange: HMAC route (OpenSSL) vs the Rust hand-rolled HMAC.
expect(
  "keyed study run BLID",
  blidKeyed("nuestra-llave-secreta", runRecord),
  "5e0f6c6ee958b0f2"
);

// Report.
let failed = 0;
for (const c of checks) {
  const mark = c.ok ? "✓" : "✗";
  if (!c.ok) failed++;
  console.log(`${mark} ${c.name}: ${c.got}${c.ok ? "" : `  (expected ${c.want})`}`);
}
console.log(
  failed === 0
    ? `\nconvergence proven: ${checks.length}/${checks.length} — two languages, one BLID`
    : `\nDIVERGENCE: ${failed} of ${checks.length} checks failed`
);
process.exit(failed === 0 ? 0 : 1);
