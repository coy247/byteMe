//! # byteme
//!
//! A playful binary string pattern analyzer. The library half exposes the
//! pure analytical primitives; the `byteme` binary in `src/main.rs` wires
//! them to a CLI with an optional retro AOL-era intro.
//!
//! The behavior contract for `BinaryModel` mirrors the legacy JS port
//! verbatim (see `legacy/tests/binaryModel.test.js`):
//! - empty strings are rejected
//! - all-zeros input returns `ratio = 0.0`
//! - all-ones input returns `ratio = f64::INFINITY` (documented contract,
//!   not a bug)

pub mod binary;
pub mod blid;
pub mod canon;
pub mod cli;
pub mod concert;
pub mod contact;
pub mod encode;
pub mod hydro;
pub mod intro;
pub mod metrics;
pub mod narrate;
pub mod output;
pub mod patterns;
pub mod rational;
pub mod sha256;
pub mod study;

pub use binary::{BinaryAnalysis, BinaryModel};

pub const VERSION: &str = env!("CARGO_PKG_VERSION");
