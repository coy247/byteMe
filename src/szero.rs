//! Signed-zero rotational channels — Radio Shack edition (booLang v2.9.1,
//! extends `signed_zero_to_zero` v2.8).
//!
//! ## The doctrine this implements
//!
//! `+0` and `-0` are NOT magnitudes (that reading is prohibited upstream).
//! They are *rotational channel identifiers*:
//!
//! - `+0` = primary channel, forward handedness, primary axis (phase 0)
//! - `-0` = orthogonal channel, witness handedness, 90° off the primary
//!
//! Magnitude zero is the *window to the engine*: every value carries
//! `(magnitude, phase, chirality)`, but a non-zero magnitude visually
//! dominates and hides the rotation. At magnitude zero the rotation is
//! left alone, visible — like a spinning top: at speed you see the mass,
//! at rest you see only the axis. The rotation was always there.
//!
//! ## The operation is transport, not construction
//!
//! Composing two channels does not build a new value — it *projects* the
//! point between channels. In the IR this is exactly:
//!
//! - `sign_out = sign_a XOR sign_b`   (two negations cancel: NOT(NOT x)=x)
//! - `phase_out = (phase_a + phase_b) mod N`   (rotation in Z_N)
//! - `mag_out` = magnitudes add, capped at the saturation limit (1)
//!
//! So two `-0` (sign bit 1, phases 1 and 3 in Z4) compose to `+0`:
//! `1 XOR 1 = 0` (plus) and `(1 + 3) mod 4 = 0` (ground, primary axis).
//! The change negative→positive is literally XOR of the sign bits; the
//! rotation is conserved as phase-addition landing on the ground.
//!
//! ## Radio Shack edition extensions (v2.9.1)
//!
//! - **Z8 oscillation engine.** The base doctrine works in Z4; the
//!   Radio Shack engine refines the phase ring to 8 slots (even = primary
//!   axis family, odd = witness/orthogonal family). The composition law is
//!   identical — only the modulus changes. [`Z4`] and [`Z8`] are provided.
//! - **Resistivity** `ρ = (R·A)/L` as an exact [`Rational`] — a structural
//!   restriction coefficient ([`resistivity`]).
//! - **Determinant preservation.** "Do not drop features when tracking
//!   zero." Stated without floats: phase composition is a *bijection* on
//!   Z_N (adding a fixed phase permutes the ring), so no slot is lost or
//!   doubled. Verified by [`phase_add_is_bijection`].
//! - **Triage defense.** The sign-inversion invariant `sgn(2n − n^k)` with
//!   trap signals `000` (negative-zero pole) and `111` (out-of-bounds
//!   structural fold). See [`triage`].
//!
//! ## Totality principle
//!
//! There is no undefined output: composition always lands in a valid
//! channel because the destination channel always exists. The system
//! never leaves the rotational algebra.
//!
//! ## Content addressing
//!
//! Every channel and every transform gets a BLID, so two distinguishable
//! `-0` inputs produce an identifiable `+0` that is auditable backward —
//! the doctrine's chain of custody, content-addressed.
//!
//! Canonical records (v1):
//! ```text
//! szero-channel/v1\nsign=<+|-> mag=<num/den> phase=<p>/<N> chirality=<...>
//! szero-transform/v1\n<in_a_full>\n<in_b_full>\nz<N>: [<pa>,<pb>] -> <po>\nsign: <a>^<b> -> <o>
//! ```

use crate::blid::Blid;
use crate::rational::Rational;

/// The base doctrine ring (v2.8): 4 phase slots.
pub const Z4: u8 = 4;
/// The Radio Shack oscillation engine ring (v2.9.1): 8 phase slots.
pub const Z8: u8 = 8;

/// Saturation overflow limit (electrical capping rule): magnitude
/// composition never exceeds 1.
pub const SATURATION_LIMIT: i128 = 1;

/// Declared overdraft ratio (asset-to-liability shift). The spec names
/// `4_to_1` but does not pin its dynamics, so it is carried as a constant,
/// not an invented mechanism.
pub const OVERDRAFT_RATIO: (i128, i128) = (4, 1);

/// Sign as a rotational channel identifier, not a magnitude.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Sign {
    /// `+` — primary channel, forward, primary axis.
    Plus,
    /// `-` — orthogonal channel, witness handedness.
    Minus,
}

impl Sign {
    /// The sign *bit*: `+` = 0, `-` = 1 (the IR representation).
    pub fn bit(self) -> u8 {
        match self {
            Sign::Plus => 0,
            Sign::Minus => 1,
        }
    }
    fn from_bit(b: u8) -> Sign {
        if b & 1 == 0 {
            Sign::Plus
        } else {
            Sign::Minus
        }
    }
    fn glyph(self) -> char {
        match self {
            Sign::Plus => '+',
            Sign::Minus => '-',
        }
    }
}

/// Handedness at a phase slot.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Chirality {
    /// Ground (phase 0): self-mirror, `complement(ground) = ground`.
    Absolute,
    /// Even non-zero slot: primary-axis family.
    Forward,
    /// Odd slot: witness / orthogonal family.
    Witness,
}

impl Chirality {
    fn of_phase(phase: u8) -> Chirality {
        if phase == 0 {
            Chirality::Absolute
        } else if phase % 2 == 0 {
            Chirality::Forward
        } else {
            Chirality::Witness
        }
    }
    fn label(self) -> &'static str {
        match self {
            Chirality::Absolute => "absolute",
            Chirality::Forward => "forward",
            Chirality::Witness => "witness",
        }
    }
}

/// A rotational channel value: `(sign, magnitude, phase)` in ring Z_N.
/// Chirality is derived from the phase, never stored independently.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Channel {
    pub sign: Sign,
    pub magnitude: Rational,
    pub phase: u8,
    pub modulus: u8,
}

impl Channel {
    /// Build a channel, normalizing the phase into `0..modulus`.
    /// `modulus` must be ≥ 1; returns None otherwise.
    pub fn new(sign: Sign, magnitude: Rational, phase: u8, modulus: u8) -> Option<Channel> {
        if modulus == 0 {
            return None;
        }
        Some(Channel {
            sign,
            magnitude,
            phase: phase % modulus,
            modulus,
        })
    }

    /// `+0` at the ground (primary axis, phase 0).
    pub fn pos_zero(modulus: u8) -> Channel {
        Channel::new(Sign::Plus, Rational::new(0, 1).unwrap(), 0, modulus).unwrap()
    }

    /// A `-0` witness at the given phase (the visible pure rotation).
    pub fn neg_zero(phase: u8, modulus: u8) -> Channel {
        Channel::new(Sign::Minus, Rational::new(0, 1).unwrap(), phase, modulus).unwrap()
    }

    /// True when this is a magnitude-zero channel — the window to the
    /// engine, where the rotation shows without magnitude covering it.
    pub fn is_pure_rotation(&self) -> bool {
        self.magnitude.num() == 0
    }

    pub fn chirality(&self) -> Chirality {
        Chirality::of_phase(self.phase)
    }

    /// Canonical record line for the channel BLID.
    pub fn canonical(&self) -> String {
        format!(
            "szero-channel/v1\nsign={} mag={} phase={}/{} chirality={}",
            self.sign.glyph(),
            self.magnitude.canonical(),
            self.phase,
            self.modulus,
            self.chirality().label(),
        )
    }

    /// The channel's content-addressed identifier.
    pub fn blid(&self) -> Blid {
        Blid::of_record(&self.canonical())
    }
}

/// Saturating exact-rational magnitude add, capped at [`SATURATION_LIMIT`].
/// Stays exact: only the cap comparison touches the bound.
fn saturating_mag(a: Rational, b: Rational) -> Rational {
    // a + b = (a.num*b.den + b.num*a.den) / (a.den*b.den)
    let num = a
        .num()
        .checked_mul(b.den())
        .and_then(|x| (b.num().checked_mul(a.den())).and_then(|y| x.checked_add(y)));
    let den = a.den().checked_mul(b.den());
    match (num, den) {
        (Some(n), Some(d)) => {
            let sum = Rational::new(n, d).unwrap_or_else(|| Rational::new(0, 1).unwrap());
            // cap at SATURATION_LIMIT/1
            let cap = Rational::new(SATURATION_LIMIT, 1).unwrap();
            if sum.num() * cap.den() > cap.num() * sum.den() {
                cap
            } else {
                sum
            }
        }
        // Overflow in the magnitude lane saturates to the cap, never wraps.
        _ => Rational::new(SATURATION_LIMIT, 1).unwrap(),
    }
}

/// The result of a transport: the emerging channel plus its audit trail.
#[derive(Debug, Clone, PartialEq)]
pub struct Transport {
    pub out: Channel,
    pub in_a: Channel,
    pub in_b: Channel,
}

impl Transport {
    /// Canonical transform record (the chain-of-custody ledger line).
    pub fn canonical(&self) -> String {
        format!(
            "szero-transform/v1\n{}\n{}\nz{}: [{},{}] -> {}\nsign: {}^{} -> {}",
            self.in_a.blid().full(),
            self.in_b.blid().full(),
            self.out.modulus,
            self.in_a.phase,
            self.in_b.phase,
            self.out.phase,
            self.in_a.sign.bit(),
            self.in_b.sign.bit(),
            self.out.sign.bit(),
        )
    }

    /// Content-addressed BLID of this transport.
    pub fn blid(&self) -> Blid {
        Blid::of_record(&self.canonical())
    }
}

/// Compose (project / transport) two channels. Total: the two channels
/// must share a modulus; if they differ, the left modulus wins and the
/// right phase is re-reduced into it (the destination channel always
/// exists — totality principle).
///
/// - sign: XOR of sign bits (two witnesses cancel to primary)
/// - phase: `(a + b) mod N` (rotation conserved)
/// - magnitude: saturating exact add, capped at the saturation limit
pub fn compose(a: Channel, b: Channel) -> Transport {
    let modulus = a.modulus;
    let sign = Sign::from_bit(a.sign.bit() ^ b.sign.bit());
    let phase = ((a.phase as u16 + (b.phase % modulus) as u16) % modulus as u16) as u8;
    let magnitude = saturating_mag(a.magnitude, b.magnitude);
    let out = Channel {
        sign,
        magnitude,
        phase,
        modulus,
    };
    Transport {
        out,
        in_a: a,
        in_b: b,
    }
}

/// Resistivity `ρ = (R·A) / L`, exact. Returns None on `L = 0` (the
/// structural restriction is undefined with zero length) or i128 overflow.
pub fn resistivity(r: Rational, a: Rational, l: Rational) -> Option<Rational> {
    if l.num() == 0 {
        return None;
    }
    // (R.num/R.den)*(A.num/A.den) / (L.num/L.den)
    //   = (R.num*A.num*L.den) / (R.den*A.den*L.num)
    let num = r.num().checked_mul(a.num())?.checked_mul(l.den())?;
    let den = r.den().checked_mul(a.den())?.checked_mul(l.num())?;
    Rational::new(num, den)
}

/// Determinant-preservation witness: adding a fixed phase `b` permutes the
/// ring Z_N (a bijection), so no phase slot is lost or doubled when
/// tracking the zero. Returns true iff the map `a ↦ (a+b) mod N` hits every
/// slot exactly once.
pub fn phase_add_is_bijection(b: u8, modulus: u8) -> bool {
    if modulus == 0 {
        return false;
    }
    let mut seen = vec![false; modulus as usize];
    for a in 0..modulus {
        let p = ((a as u16 + b as u16) % modulus as u16) as usize;
        if seen[p] {
            return false;
        }
        seen[p] = true;
    }
    seen.iter().all(|&x| x)
}

/// Triage verdict for the sign-inversion boundary check.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Triage {
    /// Within bounds, sign matches expectation.
    Ok,
    /// `000` — the value collapsed to a negative-zero pole.
    NegativeZeroPole,
    /// Sign inverted vs expectation (the detector fired).
    SignInversion,
    /// `111` — `n^k` overflowed: out-of-bounds structural fold.
    OutOfBoundsStructuralFold,
}

impl Triage {
    /// The 3-bit trap signal, where defined.
    pub fn trap_signal(self) -> Option<&'static str> {
        match self {
            Triage::NegativeZeroPole => Some("000"),
            Triage::OutOfBoundsStructuralFold => Some("111"),
            _ => None,
        }
    }
}

/// The triage defense invariant: `sgn(2n − n^k)` checked against the
/// expected sign. `sgn_expected`: -1, 0, or +1.
///
/// - `n^k` overflow → `111` out-of-bounds structural fold (the fold IS the
///   overflow).
/// - result is exactly 0 with expected sign 0 → ok; with non-zero expected
///   → `000` negative-zero pole (collapsed to the pole).
/// - sign differs from expected → sign inversion detected.
pub fn triage(n: i128, k: u32, sgn_expected: i8) -> Triage {
    let pow = match n.checked_pow(k) {
        Some(p) => p,
        None => return Triage::OutOfBoundsStructuralFold, // "111"
    };
    let val = match (2i128.checked_mul(n)).and_then(|two_n| two_n.checked_sub(pow)) {
        Some(v) => v,
        None => return Triage::OutOfBoundsStructuralFold, // "111"
    };
    let sgn = val.signum() as i8;
    if sgn == sgn_expected {
        return Triage::Ok;
    }
    // sign mismatch: distinguish the pole collapse from a plain inversion
    if val == 0 {
        Triage::NegativeZeroPole // "000"
    } else {
        Triage::SignInversion
    }
}

/// Left-fold a list of phases into a transport chain: the first phase
/// seeds a `-0` witness, each subsequent phase composes another `-0` onto
/// the running channel. Returns the step-by-step transports (the doctrine's
/// "Vista PASILLO" — corridor view). An empty or single-phase list yields
/// no transports (nothing to compose).
pub fn corridor(phases: &[u8], modulus: u8) -> Vec<Transport> {
    if phases.len() < 2 || modulus == 0 {
        return Vec::new();
    }
    let mut acc = Channel::neg_zero(phases[0], modulus);
    let mut steps = Vec::new();
    for &p in &phases[1..] {
        let t = compose(acc, Channel::neg_zero(p, modulus));
        acc = t.out;
        steps.push(t);
    }
    steps
}

#[cfg(test)]
mod tests {
    use super::*;

    fn r(n: i128, d: i128) -> Rational {
        Rational::new(n, d).unwrap()
    }

    #[test]
    fn corridor_folds_the_canonical_vector() {
        // phases [1,3] in Z4 → one transport landing on +0 ground.
        let steps = corridor(&[1, 3], Z4);
        assert_eq!(steps.len(), 1);
        assert_eq!(steps[0].out, Channel::pos_zero(Z4));
        // Fewer than two phases → nothing to compose.
        assert!(corridor(&[1], Z4).is_empty());
    }

    // ── THE central doctrine vector ──────────────────────────────────
    #[test]
    fn two_neg_zero_compose_to_pos_zero_ground() {
        // c_A = -0 @ phase 1 (witness), c_B = -0 @ phase 3 (witness), Z4.
        let a = Channel::neg_zero(1, Z4);
        let b = Channel::neg_zero(3, Z4);
        let t = compose(a, b);
        // sign: 1 XOR 1 = 0 → Plus ; phase: (1+3) mod 4 = 0 → ground
        assert_eq!(t.out.sign, Sign::Plus);
        assert_eq!(t.out.phase, 0);
        assert_eq!(t.out.chirality(), Chirality::Absolute);
        assert!(t.out.is_pure_rotation());
        // It is exactly +0 at ground.
        assert_eq!(t.out, Channel::pos_zero(Z4));
    }

    #[test]
    fn double_negation_is_identity_on_sign() {
        // NOT(NOT(+)) = + ; the sign lane is pure XOR.
        let plus = Channel::new(Sign::Plus, r(0, 1), 0, Z4).unwrap();
        let neg = Channel::neg_zero(0, Z4);
        let once = compose(plus, neg).out.sign;
        let twice = compose(compose(plus, neg).out, neg).out.sign;
        assert_eq!(once, Sign::Minus);
        assert_eq!(twice, Sign::Plus);
    }

    #[test]
    fn phase_is_additive_mod_n_in_both_rings() {
        assert_eq!(
            compose(Channel::neg_zero(1, Z4), Channel::neg_zero(3, Z4))
                .out
                .phase,
            0
        );
        // Z8: same two witnesses do NOT land on ground — higher resolution.
        assert_eq!(
            compose(Channel::neg_zero(1, Z8), Channel::neg_zero(3, Z8))
                .out
                .phase,
            4
        );
        // In Z8 it takes phase 5 + 3 to wrap to ground.
        assert_eq!(
            compose(Channel::neg_zero(5, Z8), Channel::neg_zero(3, Z8))
                .out
                .phase,
            0
        );
    }

    #[test]
    fn chirality_even_odd_rule() {
        assert_eq!(Channel::neg_zero(0, Z8).chirality(), Chirality::Absolute);
        assert_eq!(Channel::neg_zero(2, Z8).chirality(), Chirality::Forward);
        assert_eq!(Channel::neg_zero(3, Z8).chirality(), Chirality::Witness);
    }

    // ── recursion / transport composition ────────────────────────────
    #[test]
    fn recursive_transport_stays_in_channel_space() {
        // The doctrine's chain, sign lane only (XOR):
        //   T1: c_A(-0) × c_B(-0) → c_C(+0)   [Minus^Minus = Plus]
        //   T2: c_C(+0) × c_D(-0) → c_E(-0)   [Plus ^Minus = Minus]
        //   T3: c_E(-0) × c_F(-0) → c_G(+0)   [Minus^Minus = Plus]
        let c = compose(Channel::neg_zero(1, Z4), Channel::neg_zero(3, Z4)).out;
        assert_eq!(c.sign, Sign::Plus);
        let e = compose(c, Channel::neg_zero(2, Z4)).out;
        assert_eq!(e.sign, Sign::Minus);
        let g = compose(e, Channel::neg_zero(0, Z4)).out;
        assert_eq!(g.sign, Sign::Plus);
        // The composition of projections is a projection: still a channel.
        assert!(g.phase < Z4);
    }

    // ── determinant preservation ─────────────────────────────────────
    #[test]
    fn phase_add_preserves_the_ring() {
        for n in [Z4, Z8] {
            for b in 0..n {
                assert!(
                    phase_add_is_bijection(b, n),
                    "lost a slot at b={} N={}",
                    b,
                    n
                );
            }
        }
    }

    // ── magnitude saturation ─────────────────────────────────────────
    #[test]
    fn magnitude_saturates_at_the_limit() {
        // 3/4 + 3/4 = 3/2 > 1 → capped at 1/1.
        let a = Channel::new(Sign::Plus, r(3, 4), 0, Z4).unwrap();
        let out = compose(a, a).out;
        assert_eq!(out.magnitude, r(1, 1));
    }

    #[test]
    fn magnitude_under_limit_is_exact() {
        // 1/4 + 1/2 = 3/4, untouched.
        let a = Channel::new(Sign::Plus, r(1, 4), 0, Z4).unwrap();
        let b = Channel::new(Sign::Plus, r(1, 2), 0, Z4).unwrap();
        assert_eq!(compose(a, b).out.magnitude, r(3, 4));
    }

    // ── resistivity ──────────────────────────────────────────────────
    #[test]
    fn resistivity_is_exact() {
        // ρ = R·A/L with R=2, A=3/2, L=4 → 6/2 /4 = 3/4.
        let rho = resistivity(r(2, 1), r(3, 2), r(4, 1)).unwrap();
        assert_eq!(rho, r(3, 4));
    }

    #[test]
    fn resistivity_zero_length_is_undefined() {
        assert!(resistivity(r(2, 1), r(3, 2), r(0, 1)).is_none());
    }

    // ── triage ───────────────────────────────────────────────────────
    #[test]
    fn triage_matches_expected_sign() {
        // n=3,k=1: 2*3 - 3 = 3 > 0, expected +1 → ok.
        assert_eq!(triage(3, 1, 1), Triage::Ok);
    }

    #[test]
    fn triage_negative_zero_pole_signal_000() {
        // n=2,k=2: 2*2 - 4 = 0, expected +1 (non-zero) → 000 pole.
        let v = triage(2, 2, 1);
        assert_eq!(v, Triage::NegativeZeroPole);
        assert_eq!(v.trap_signal(), Some("000"));
    }

    #[test]
    fn triage_sign_inversion_detected() {
        // n=3,k=2: 2*3 - 9 = -3 < 0, but expected +1 → inversion.
        assert_eq!(triage(3, 2, 1), Triage::SignInversion);
    }

    #[test]
    fn triage_out_of_bounds_fold_signal_111() {
        // n^k overflow → 111 structural fold.
        let v = triage(i128::MAX, 2, 1);
        assert_eq!(v, Triage::OutOfBoundsStructuralFold);
        assert_eq!(v.trap_signal(), Some("111"));
    }

    // ── content addressing / chain of custody ────────────────────────
    #[test]
    fn distinguishable_neg_zeros_have_distinct_blids() {
        // Two -0 at different phases are distinguishable (A0 != B0).
        assert_ne!(
            Channel::neg_zero(1, Z4).blid(),
            Channel::neg_zero(3, Z4).blid()
        );
    }

    #[test]
    fn transport_is_deterministic_and_auditable() {
        let t1 = compose(Channel::neg_zero(1, Z4), Channel::neg_zero(3, Z4));
        let t2 = compose(Channel::neg_zero(1, Z4), Channel::neg_zero(3, Z4));
        assert_eq!(t1.blid(), t2.blid());
        // The transport BLID binds both inputs: swapping a phase changes it.
        let t3 = compose(Channel::neg_zero(2, Z4), Channel::neg_zero(3, Z4));
        assert_ne!(t1.blid(), t3.blid());
    }

    #[test]
    fn totality_no_panic_over_arbitrary_phases() {
        // Composition is total: never panics, always a valid channel.
        for pa in 0u8..20 {
            for pb in 0u8..20 {
                let t = compose(Channel::neg_zero(pa, Z8), Channel::neg_zero(pb, Z8));
                assert!(t.out.phase < Z8);
            }
        }
    }
}
