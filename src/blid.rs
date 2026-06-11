//! BLIDs — Binary Lattice IDentifiers. Content-addressed identifiers for
//! analyses.
//!
//! The BLID of an analysis is a hash of the *normalized bits only*, under
//! a versioned canonical form. Because every metric byteme computes is a
//! pure function of those bits, the BLID identifies the complete analysis
//! content: two independent routes that arrive at the same bits — e.g.
//! the text `"Hi"` and the literal bits `0100100001101001` — produce the
//! same BLID. That is the content-addressed convergence property:
//! independent pipelines can verify they agree by comparing BLIDs alone,
//! without exchanging payloads.
//!
//! Canonical form v1:
//! ```text
//! sha256( "byteme/blid/v1\n" || <normalized binary string, ASCII 0/1> )
//! ```
//!
//! - `short()` — first 16 hex chars, for receipts and human eyes
//! - `full()`  — all 64 hex chars, for machine verification
//!
//! Uses: deduplicating analysis receipts, cache keys, linking results in
//! work-state journals, and verifying that two independently produced
//! results are byte-identical in meaning.

use crate::sha256;

const DOMAIN_V1: &[u8] = b"byteme/blid/v1\n";

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Blid {
    hex: String,
}

impl Blid {
    /// Compute the BLID of a normalized binary string.
    ///
    /// The caller is responsible for normalization (whitespace stripped /
    /// text already encoded to bits) — pass the same string the analysis
    /// actually ran on.
    pub fn of_binary(binary: &str) -> Self {
        let mut msg = Vec::with_capacity(DOMAIN_V1.len() + binary.len());
        msg.extend_from_slice(DOMAIN_V1);
        msg.extend_from_slice(binary.as_bytes());
        Self {
            hex: sha256::hex(&sha256::digest(&msg)),
        }
    }

    /// Compute the BLID of an arbitrary canonical record (used by
    /// higher-level result sets, e.g. the interdimensional loop import).
    pub fn of_record(record: &str) -> Self {
        let mut msg = Vec::with_capacity(DOMAIN_V1.len() + record.len());
        msg.extend_from_slice(DOMAIN_V1);
        msg.extend_from_slice(record.as_bytes());
        Self {
            hex: sha256::hex(&sha256::digest(&msg)),
        }
    }

    /// First 16 hex chars — receipt-friendly.
    pub fn short(&self) -> &str {
        &self.hex[..16]
    }

    /// Full 64-char hex digest.
    pub fn full(&self) -> &str {
        &self.hex
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deterministic_across_calls() {
        assert_eq!(Blid::of_binary("0101"), Blid::of_binary("0101"));
    }

    #[test]
    fn different_bits_different_blid() {
        assert_ne!(Blid::of_binary("0101"), Blid::of_binary("0110"));
    }

    #[test]
    fn convergence_two_routes_one_blid() {
        // "Hi" encodes to 0100100001101001. Whether the bits arrived as
        // text or as literal bits, the BLID is identical.
        let via_text = Blid::of_binary(&crate::encode::to_binary("Hi"));
        let via_bits = Blid::of_binary("0100100001101001");
        assert_eq!(via_text, via_bits);
    }

    #[test]
    fn domain_separated_from_raw_sha256() {
        // A BLID must NOT equal the bare sha256 of the bits — the domain
        // prefix prevents cross-protocol collisions.
        let blid = Blid::of_binary("0101");
        let bare = sha256::hex(&sha256::digest(b"0101"));
        assert_ne!(blid.full(), bare);
    }

    #[test]
    fn short_is_prefix_of_full() {
        let b = Blid::of_binary("11110000");
        assert_eq!(b.short(), &b.full()[..16]);
        assert_eq!(b.short().len(), 16);
        assert_eq!(b.full().len(), 64);
    }

    #[test]
    fn pinned_vector_0101() {
        // Pinned at introduction. If this changes, the canonical form
        // changed — that requires a version bump to byteme/blid/v2, not
        // an edit to this test.
        let b = Blid::of_binary("0101");
        assert_eq!(b.full().len(), 64);
        // Self-consistency: recompute from first principles.
        let expect = sha256::hex(&sha256::digest(b"byteme/blid/v1\n0101"));
        assert_eq!(b.full(), expect);
    }
}
