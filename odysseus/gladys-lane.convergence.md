# Convergence receipt — booLang ↔ byteMe handshake CLOSED

> The first completed cross-system handshake under
> `docs/odysseus-handshake.md`. Kept as the permanent record of the
> exchange; the protocol worked exactly as designed.

## The exchange

| Step | Side | Artifact |
|---|---|---|
| Offer | byteMe | `odysseus/gladys-lane.invitation.md` (PR #6, merged `b7ae465`) |
| Implementation | booLang | `scripts/verify_byteme_convergence.ts` — written against booLang's **authoritative** 32-vector source, not byteMe's copy |
| Convergence | booLang | `BLID-CONVERGE ed4cd25fcbfab234` |
| Acknowledgement | booLang | `BLID-OK ed4cd25fcbfab234`, emitted via commit `8f9503af` on `feature/mining-float-closure` |
| This receipt | byteMe | closes the lane |

## What converged

```
byteMe  (Rust, hand-rolled FIPS 180-4 SHA-256):   ed4cd25fcbfab234
byteMe  (Deno/ring, verify/crosscheck.mjs):       ed4cd25fcbfab234
booLang (Deno, authoritative vector source):      ed4cd25fcbfab234
```

Three implementations, two languages, three independent data copies —
one identifier. Per the protocol, equality of the short BLID proves the
underlying study data is byte-identical in canonical form
(`study-entry/v2` / `study-run/v2`, gcd-reduced rationals).

## What this means for float-closure

The April failure mode — a floating-point counter drifting unobserved
for five weeks — is now structurally detectable in one line: any party
recomputes the run BLID from its own data and compares 16 hex chars.
Divergence surfaces immediately as `BLID-DIVERGE <mine> vs <theirs>`;
silence-while-wrong is no longer a stable state.

## Delimited

- This receipt proves convergence of the 32-vector study set as of
  2026-06-11. New data requires new runs — convergence is per-content,
  not a standing certificate.
- The booLang-side verification script lives in their tree; byteMe
  pins only the exchanged BLIDs and the protocol.

— recorded 2026-06-11, byteMe lane
