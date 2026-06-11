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
const scalars = [
  -1977345647, -1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 0.1, 0.7, 0.8, 0.9113, 0.94, 3, 5.822, 128,
];

// JS String(Number) is shortest-roundtrip, same contract as Rust's {}.
const entryRecord = (a, b, s) => `loop-entry/v1\n${a}/${b} ${String(s)}`;

const checks = [];
const expect = (name, got, want) => checks.push({ name, got, want, ok: got === want });

// 1. The interdimensional loop run BLID, recomputed from scratch.
const entryBlidsFull = vectors.map(([a, b], i) =>
  sha256hex(DOMAIN + entryRecord(a, b, scalars[i]))
);
const runRecord = "loop-run/v1\n" + entryBlidsFull.map((h) => h + "\n").join("");
expect("loop run BLID", blid(runRecord), "55669eccbbfc4cfa");

// 2. Spot-check entry BLIDs (first, a float-scalar one, last).
expect("entry 0 BLID", entryBlidsFull[0].slice(0, 16), "5f5438b01b54d7e3");
expect("entry 27 BLID (scalar 0.9113)", entryBlidsFull[27].slice(0, 16), "61eb04895c108455");
expect("entry 31 BLID", entryBlidsFull[31].slice(0, 16), "5901987551030c70");

// 3. The bit-string route: "Hi" → UTF-8 bits.
const toBits = (text) =>
  [...Buffer.from(text, "utf8")].map((b) => b.toString(2).padStart(8, "0")).join("");
expect("bits BLID (Hi)", blid(toBits("Hi")), "a2fc4a037c913df5");

// 4. The formula of eight: int canonical record.
expect("int 8 BLID", blid("int/v1\n8"), "6979745b5e222ca3");

// 5. Keyed exchange: HMAC route (OpenSSL) vs the Rust hand-rolled HMAC.
//    Pinned from the live run with key "nuestra-llave-secreta".
expect(
  "keyed loop run BLID",
  blidKeyed("nuestra-llave-secreta", runRecord),
  "c22d1336b7c62f38"
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
