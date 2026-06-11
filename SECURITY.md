# Security policy

## Reporting

If you find a security issue, please email the maintainer
(edhead76@icloud.com) rather than opening a public issue. You will get a
response within a reasonable window.

## What is and isn't a secret in this repository

This repo contains no live credentials. To keep automated secret scanners
honest — and to keep this an exemplary example — note:

- **Key-like strings in tests are fixtures, never real secrets.** The
  keyed-BLID tests use a deliberately self-labelling demo key,
  `example-demo-key-not-a-secret`. It is published on purpose so the
  cross-language convergence test can pin a value. It protects nothing.
- **The 64-hex BLID values are SHA-256 / HMAC-SHA256 digests**, not
  tokens. They are content-addressed identifiers and are meant to be
  public (the unkeyed ones) or pinned (all of them). A digest is not a
  credential.
- **No wallet addresses, API keys, access tokens, or private keys** are
  tracked. If a scanner flags something, it is one of the two cases
  above; please confirm before acting.

## Cryptography scope

byteme hand-rolls SHA-256 (FIPS 180-4) and HMAC-SHA256 (RFC 2104) in
`src/sha256.rs`, gated by the published NIST and RFC 4231 test vectors.
These are used for **content addressing** (BLIDs) and for keyed
commitments, where the goal is integrity and convergence, not protecting
data against a resourced adversary. For adversarial confidentiality, use
a vetted cryptography library and a real key-management system; the
in-crate implementation is intentionally minimal and dependency-free.

## Keyed BLIDs

An unkeyed BLID is a **public commitment**: anyone can verify it, and for
low-entropy content the original value can be recovered from it by
exhaustive search. Use `--key <secret>` (HMAC) when a discovered BLID must
reveal nothing. Pass the key via a path your environment keeps private;
note that command-line arguments may be visible to other local processes
on shared systems.
