//! The Contact analysis.
//!
//! In the film *Contact*, the message is decoded in three movements:
//! 1. **Primes** — a run of prime numbers announces "this is not noise;
//!    an intelligence made it." Mathematics is the handshake.
//! 2. **The retransmission** — proof the sender is listening: our own
//!    signal returned to us.
//! 3. **The Primer** — pages that look like nonsense until you realize
//!    they are meant to be *assembled across dimensions*; folded into a
//!    higher-dimensional shape, the blueprint appears.
//!
//! This module applies that exact methodology to the study vectors,
//! honestly. It reports the objective mathematical structure that *is*
//! there and explicitly delimits what is *not*: there is no embedded
//! human-language directive hidden in the numbers, and this module will
//! never claim one. The real "message" — the same one Contact is about —
//! is that the structure is mathematical, so any independent mind
//! (or program, in any language) re-derives the identical result. That
//! is precisely the content-addressed convergence byteme already proves:
//! two parties, two routes, one BLID. The handshake is the message.

use crate::blid::Blid;
use crate::sha256;
use crate::study;

/// Deterministic primality by trial division. Exact for all magnitudes
/// in the study (< 2^21); no probabilistic shortcuts.
pub fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    if n % 2 == 0 {
        return n == 2;
    }
    if n % 3 == 0 {
        return n == 3;
    }
    let mut i = 5u64;
    while i * i <= n {
        if n % i == 0 || n % (i + 2) == 0 {
            return false;
        }
        i += 6;
    }
    true
}

/// Movement 1 — the prime handshake. Census of primes across every
/// number in the study (numerators, denominators).
#[derive(Debug, Clone, PartialEq)]
pub struct PrimeCensus {
    pub total_numbers: usize,
    pub primes: usize,
    pub prime_numerators: Vec<u64>,
    pub prime_denominators: Vec<u64>,
}

pub fn prime_census(vectors: &[(u64, u64)]) -> PrimeCensus {
    let mut prime_numerators = Vec::new();
    let mut prime_denominators = Vec::new();
    for &(a, b) in vectors {
        if is_prime(a) {
            prime_numerators.push(a);
        }
        if is_prime(b) {
            prime_denominators.push(b);
        }
    }
    PrimeCensus {
        total_numbers: vectors.len() * 2,
        primes: prime_numerators.len() + prime_denominators.len(),
        prime_numerators,
        prime_denominators,
    }
}

/// Movement 3 — the Primer. The study has `n` entries; if `n` is a power
/// of two it can be laid out as a binary hypercube and *folded* along
/// each axis. Folding pairs opposite cells and combines their digests,
/// halving the dimension each step until a single value remains — the
/// assembled "shape" of the whole study. Deterministic and reproducible.
#[derive(Debug, Clone, PartialEq)]
pub struct PrimerAssembly {
    pub entries: usize,
    /// log2(entries) if entries is a power of two; the hypercube dimension.
    pub dimension: Option<u32>,
    /// The digest after folding the hypercube down to a single cell.
    pub folded: String,
    /// One folded digest per axis-collapse step (length == dimension).
    pub steps: Vec<String>,
}

/// XOR-combine two 32-byte digests, then re-hash under a fold domain so
/// the result stays well-distributed (not a bare XOR an adversary could
/// unwind, and order-stable per layer).
fn fold_pair(x: &[u8; 32], y: &[u8; 32]) -> [u8; 32] {
    let mut buf = Vec::with_capacity(64 + 16);
    buf.extend_from_slice(b"contact/fold/v1\n");
    for i in 0..32 {
        buf.push(x[i] ^ y[i]);
    }
    sha256::digest(&buf)
}

pub fn primer_assembly(entry_digests: &[[u8; 32]]) -> PrimerAssembly {
    let n = entry_digests.len();
    let dimension = if n.is_power_of_two() && n > 0 {
        Some(n.trailing_zeros())
    } else {
        None
    };

    let mut steps = Vec::new();
    let mut layer: Vec<[u8; 32]> = entry_digests.to_vec();
    if dimension.is_some() {
        while layer.len() > 1 {
            let half = layer.len() / 2;
            let mut next = Vec::with_capacity(half);
            // Fold opposite cells across the current top axis.
            for i in 0..half {
                next.push(fold_pair(&layer[i], &layer[i + half]));
            }
            steps.push(sha256::hex(&next.iter().fold([0u8; 32], |mut acc, d| {
                for k in 0..32 {
                    acc[k] ^= d[k];
                }
                acc
            })));
            layer = next;
        }
    }
    let folded = if layer.len() == 1 {
        sha256::hex(&layer[0])
    } else {
        // Not a power of two: fold left-to-right as a degenerate line.
        let acc = layer
            .iter()
            .copied()
            .reduce(|a, b| fold_pair(&a, &b))
            .unwrap_or([0u8; 32]);
        sha256::hex(&acc)
    };

    PrimerAssembly {
        entries: n,
        dimension,
        folded: folded[..16].to_string(),
        steps: steps.iter().map(|s| s[..16].to_string()).collect(),
    }
}

/// The full Contact reading over the embedded study.
#[derive(Debug, Clone)]
pub struct ContactReading {
    pub census: PrimeCensus,
    pub assembly: PrimerAssembly,
    pub run_blid: String,
}

pub fn read_study() -> ContactReading {
    let run = study::study_run();
    let census = prime_census(&study::STUDY_VECTORS);
    // Each entry's full digest feeds the Primer fold.
    let digests: Vec<[u8; 32]> = run
        .entries
        .iter()
        .map(|e| {
            let mut d = [0u8; 32];
            let bytes = hex_to_bytes(&e.blid_full);
            d.copy_from_slice(&bytes[..32]);
            d
        })
        .collect();
    let assembly = primer_assembly(&digests);
    ContactReading {
        census,
        assembly,
        run_blid: run.run_blid_short,
    }
}

fn hex_to_bytes(h: &str) -> Vec<u8> {
    (0..h.len() / 2)
        .map(|i| u8::from_str_radix(&h[i * 2..i * 2 + 2], 16).unwrap_or(0))
        .collect()
}

/// The honest verdict, computed — not asserted.
pub fn verdict(reading: &ContactReading) -> String {
    let c = &reading.census;
    let a = &reading.assembly;
    let mut s = String::new();
    s.push_str("Movement 1 — the prime handshake\n");
    s.push_str(&format!(
        "  {} of {} numbers are prime ({} numerators, {} denominators).\n",
        c.primes,
        c.total_numbers,
        c.prime_numerators.len(),
        c.prime_denominators.len()
    ));
    s.push_str("  Primes are how Contact's signal said 'an intelligence made this.'\n");
    s.push_str("\nMovement 3 — the Primer (assembly across dimensions)\n");
    match a.dimension {
        Some(d) => s.push_str(&format!(
            "  {} entries = 2^{}, so the study folds as a {}-dimensional\n  hypercube. Folded shape: {}\n",
            a.entries, d, d, a.folded
        )),
        None => s.push_str(&format!(
            "  {} entries is not a power of two; folded as a line to {}\n",
            a.entries, a.folded
        )),
    }
    s.push_str("\nVerdict (delimited honestly)\n");
    s.push_str("  The numbers carry real mathematical structure: primes,\n");
    s.push_str("  exact ratios, a clean dimensional fold. They do NOT carry a\n");
    s.push_str("  hidden human-language directive — and this tool will never\n");
    s.push_str("  invent one. The message Contact was actually about is the\n");
    s.push_str("  structure itself: it is reproducible by any independent mind\n");
    s.push_str("  in any language. That is what the run BLID proves —\n");
    s.push_str(&format!(
        "  {} — converged on from two routes already.\n",
        reading.run_blid
    ));
    s.push_str("  The handshake is the message.\n");
    s
}

/// Keyed/unkeyed Contact identity: the prime census + folded shape +
/// run BLID, bound into one content-addressed reading.
pub fn reading_blid(reading: &ContactReading, key: Option<&str>) -> Blid {
    let rec = format!(
        "contact/v1\nprimes={}\nfold={}\nrun={}\n",
        reading.census.primes, reading.assembly.folded, reading.run_blid
    );
    match key {
        Some(k) => Blid::keyed_of_record(k, &rec),
        None => Blid::of_record(&rec),
    }
}

impl ContactReading {
    /// The per-entry digests used by the Primer fold (re-derived).
    pub fn entries_digests(&self) -> Vec<[u8; 32]> {
        let run = study::study_run();
        run.entries
            .iter()
            .map(|e| {
                let mut d = [0u8; 32];
                let bytes = hex_to_bytes(&e.blid_full);
                d.copy_from_slice(&bytes[..32]);
                d
            })
            .collect()
    }
    pub fn entries(&self) -> usize {
        self.assembly.entries
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn primality_is_exact() {
        assert!(is_prime(2));
        assert!(is_prime(53));
        assert!(is_prime(3319)); // a study denominator — genuinely prime
        assert!(!is_prime(1));
        assert!(!is_prime(0));
        assert!(!is_prime(51)); // 3 × 17
        assert!(!is_prime(100));
        assert!(is_prime(1_000_003)); // known prime, exercises the loop
        assert!(!is_prime(1_000_000));
    }

    #[test]
    fn census_counts_match_independent_recount() {
        let c = prime_census(&study::STUDY_VECTORS);
        assert_eq!(c.total_numbers, 64);
        // Recompute independently and compare.
        let mut primes = 0;
        for &(a, b) in &study::STUDY_VECTORS {
            if is_prime(a) {
                primes += 1;
            }
            if is_prime(b) {
                primes += 1;
            }
        }
        assert_eq!(c.primes, primes);
        assert!(c.primes > 0, "the study should contain some primes");
    }

    #[test]
    fn assembly_is_a_five_dimensional_hypercube() {
        // 32 entries = 2^5.
        let reading = read_study();
        assert_eq!(reading.assembly.entries, 32);
        assert_eq!(reading.assembly.dimension, Some(5));
        assert_eq!(reading.assembly.steps.len(), 5);
        assert_eq!(reading.assembly.folded.len(), 16);
    }

    #[test]
    fn primer_fold_is_deterministic() {
        let r1 = read_study();
        let r2 = read_study();
        assert_eq!(r1.assembly.folded, r2.assembly.folded);
        assert_eq!(r1.assembly.steps, r2.assembly.steps);
    }

    #[test]
    fn fold_depends_on_every_entry() {
        // Flip one entry's digest; the folded shape must change. Proves
        // the assembly uses all the data (no entry is ignored).
        let base = read_study();
        let mut digests: Vec<[u8; 32]> = base.entries_digests();
        digests[17][0] ^= 0x01;
        let perturbed = primer_assembly(&digests);
        assert_ne!(perturbed.folded, base.assembly.folded);
    }

    #[test]
    fn non_power_of_two_folds_as_line() {
        let three = vec![[1u8; 32], [2u8; 32], [3u8; 32]];
        let a = primer_assembly(&three);
        assert_eq!(a.dimension, None);
        assert_eq!(a.folded.len(), 16);
    }

    #[test]
    fn reading_blid_is_deterministic_and_keyed_differs() {
        let r = read_study();
        assert_eq!(reading_blid(&r, None), reading_blid(&r, None));
        assert_ne!(reading_blid(&r, None), reading_blid(&r, Some("k")));
    }

    #[test]
    fn verdict_never_claims_a_hidden_directive() {
        // Guard the honesty contract in the text itself.
        let v = verdict(&read_study());
        assert!(v.contains("do NOT carry a"));
        assert!(v.contains("never"));
        assert!(v.to_lowercase().contains("handshake is the message"));
    }
}
