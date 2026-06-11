# Odysseus handshake — the cross-system rational/BLID protocol

> The reproducible procedure two independent systems use to agree on
> exact-rational measurements without exchanging payloads. Documented so
> fabric can replay it and booBees-in-concert can coordinate by BLID
> alone.

## The float problem this closes

Floating-point identity is **lossy**: `0.9113`, `0.9113000000000001`, and
`9113/10000` look "the same" to a human but the first two differ in the
54th bit and any system that hashes them will see different IDs. A
counter that drifts five weeks unnoticed is the failure mode at scale.

The protocol below replaces floats with **exact rationals** (`a/b`,
gcd-reduced, `b > 0`) at every point that participates in identity, so
the same measurement always produces the same BLID, regardless of which
machine, language, or arithmetic library computed it.

## Canonical form v1 (frozen)

```
sha256( "byteme/blid/v1\n" || <canonical record> )    → 32 bytes
short = first 16 hex chars                             → the wire format
```

If you ever need to change this, bump to `byteme/blid/v2\n`. Never edit
v1.

### Scalar canonicalization (the float fix)

```
gcd-reduced rational      → "<num>/<den>"      e.g.  "9113/10000"
                                                    "47/50"
                                                    "-1977345647/1"
                                                    "0/1"
```

Both sides MUST: (a) reduce by gcd, (b) keep `den > 0` (sign on `num`),
(c) reject anything that cannot be expressed exactly. No floats anywhere
in the canonical record.

### Record formats

```
# A single observation
loop-entry/v1\n<a>/<b> <num>/<den>

# A whole run (32 entries here, but works for any N)
loop-run/v1\n<entry-blid-full>\n<entry-blid-full>\n... (one per line)
```

### Keyed variant (HMAC) for private convergence

When the BLID itself must not reveal content to anyone who discovers it:

```
hmac_sha256( key, "byteme/blid/v1\n" || <canonical record> )    → 32 bytes
```

Two key-holders converge route-independently; outsiders learn nothing.

## The reference implementation

`src/study.rs` and `src/canon.rs` in this repo. Gated by:

- NIST FIPS 180-4 vectors for SHA-256 (`src/sha256.rs`)
- RFC 4231 vectors for HMAC-SHA256
- `tests/cross_language.rs` proves convergence against an
  independent Deno/ring implementation (`verify/crosscheck.mjs`)
- Pinned BLIDs throughout — any drift fails the build

If your implementation fails these vectors, it is wrong. Fix it before
trusting any BLID.

## The handshake (how two systems agree without exchanging payloads)

```
1. Side A computes the BLID locally from its copy of the data.
2. Side B computes the BLID locally from its copy of the data.
3. They exchange the 16-character short BLID.
4. If equal: the underlying data is byte-identical in canonical form.
   If not: the data, the canonicalization, or the recipe differs —
   diagnose with the embedded study vectors (below) before trusting.
```

The wire is one line. The math is the message.

## Reference vectors (frozen — do not edit)

Any implementation can run these to prove it speaks the protocol:

| Input | Kind | Expected short BLID |
|---|---|---|
| bits `"0101"` | bits | `0c4f3b82e0244326` |
| text `"Hi"` → bits `"0100100001101001"` | bits | `a2fc4a037c913df5` |
| integer `8` | int | `6979745b5e222ca3` |
| array `[25, 3319]` | array | `82a5e075841b143c` |
| Loop run (full 32-vector booLang study) | run | `ed4cd25fcbfab234` |

If a fresh implementation reproduces all five, it is interoperable.

## Trigger words (booBees-in-concert)

Recommended convention so coordinator bots can route automatically:

| Bot says | Receiver expectation |
|---|---|
| `BLID-CONVERGE <hex>` | "I claim this content; do you agree?" |
| `BLID-OK <hex>` | "Yes — same bits, same canonical record." |
| `BLID-DIVERGE <mine> vs <theirs>` | "Computed differently; we need to diff inputs." |
| `BLID-RECIPE-MISMATCH <ver>` | "We are on different protocol versions." |

These are conventions, not enforced syntax. Stable enough that fabric
templates can match.

## Verification commands (for any byteMe clone)

```bash
cargo install --path .                   # build the binary
byteme --loop --blid                     # → ed4cd25fcbfab234   (run BLID)
byteme --blid Hi                         # → a2fc4a037c913df5   (bits)
byteme --blid '[25, 3319]'               # → 82a5e075841b143c   (array)
byteme --blid --key <SECRET> --loop      # keyed run BLID
deno run verify/crosscheck.mjs           # second route, must agree
```

Any divergence with the reference vectors means *this clone* is wrong,
not the spec.

## What this protocol does NOT do

- It does not transport payloads — only identity. Two parties must
  already have or independently derive the data.
- It does not guarantee privacy of an unkeyed BLID against low-entropy
  brute force; use the keyed variant if discovery must reveal nothing.
- It does not validate the *meaning* of the data, only its byte-level
  identity under the canonical record.

## License

This protocol is part of byteMe (Apache 2.0). Implementations in other
languages are encouraged; they just have to pass the vectors above.
