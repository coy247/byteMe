//! Output formatting. Two modes:
//!   - formal: clean Unicode-bordered tables, intentional color, learnable
//!   - json:   stable machine-readable JSON

use crate::binary::BinaryAnalysis;
use crate::blid::Blid;
use crate::hydro::{Hydration, Walk};
use crate::interloop::LoopRun;
use crate::metrics::Metrics;
use crate::patterns::{PatternKind, PatternReport};

pub struct Theme {
    pub color: bool,
}

impl Theme {
    pub fn fmt(&self, code: &str, body: &str) -> String {
        if self.color {
            format!("\x1b[{}m{}\x1b[0m", code, body)
        } else {
            body.to_string()
        }
    }
    pub fn dim(&self, s: &str) -> String {
        self.fmt("2", s)
    }
    pub fn bold(&self, s: &str) -> String {
        self.fmt("1", s)
    }
    pub fn cyan(&self, s: &str) -> String {
        self.fmt("36", s)
    }
    pub fn green(&self, s: &str) -> String {
        self.fmt("32", s)
    }
    pub fn yellow(&self, s: &str) -> String {
        self.fmt("33", s)
    }
}

pub fn format_report(
    input: &str,
    binary: &str,
    analysis: &BinaryAnalysis,
    metrics: &Metrics,
    patterns: &PatternReport,
    verbose: bool,
    theme: &Theme,
) -> String {
    let mut out = String::new();
    let width = 60;
    let border = "═".repeat(width - 2);

    out.push_str(&theme.cyan(&format!("╔{}╗\n", border)));
    out.push_str(&theme.cyan(&format!(
        "║ {:<w$} ║\n",
        theme.bold("ByteMe Analysis"),
        w = width - 4 + theme.bold("ByteMe Analysis").len() - "ByteMe Analysis".len()
    )));
    out.push_str(&theme.cyan(&format!("╠{}╣\n", border)));

    let show_bin = if binary.len() > 48 {
        format!("{}…", &binary[..48])
    } else {
        binary.to_string()
    };
    out.push_str(&row(theme, "Input", input, width));
    out.push_str(&row(theme, "Binary", &show_bin, width));
    out.push_str(&row(
        theme,
        "Length",
        &format!("{} bits", analysis.length),
        width,
    ));
    out.push_str(&theme.cyan(&format!("╟{}╢\n", "─".repeat(width - 2))));

    out.push_str(&row(
        theme,
        "Ones / Zeros",
        &format!("{} / {}", analysis.ones, analysis.zeros),
        width,
    ));
    out.push_str(&row(
        theme,
        "Ratio (1:0)",
        &format_ratio(analysis.ratio),
        width,
    ));
    out.push_str(&row(
        theme,
        "Entropy",
        &format!("{:.4} bits", metrics.entropy),
        width,
    ));
    out.push_str(&row(
        theme,
        "Longest run",
        &format!("{} bits", metrics.longest_run),
        width,
    ));
    out.push_str(&row(
        theme,
        "Distinct runs",
        &format!("{}", metrics.runs),
        width,
    ));
    out.push_str(&row(
        theme,
        "Alternating?",
        if metrics.alternating { "yes" } else { "no" },
        width,
    ));
    out.push_str(&row(
        theme,
        "Burstiness",
        &format!("{:.4}", metrics.burstiness),
        width,
    ));
    out.push_str(&row(
        theme,
        "Classification",
        format_kind(&patterns.classification),
        width,
    ));
    out.push_str(&row(theme, "BLID", Blid::of_binary(binary).short(), width));

    out.push_str(&theme.cyan(&format!("╚{}╝\n", border)));

    if verbose {
        out.push('\n');
        out.push_str(&theme.bold("What these numbers mean\n"));
        out.push_str(&theme.dim("  Entropy "));
        out.push_str("near 1.0 = maximally unpredictable; near 0 = constant.\n");
        out.push_str(&theme.dim("  Longest run "));
        out.push_str("flags streaks (e.g. a long string of 1s).\n");
        out.push_str(&theme.dim("  Distinct runs "));
        out.push_str("counts how many times the bit flips, plus one.\n");
        out.push_str(&theme.dim("  Burstiness "));
        out.push_str("0 ≈ evenly mixed; closer to 1 = clumped.\n");
        out.push_str(&theme.dim("  Classification "));
        out.push_str("informs the predictor; 'mixed' is the interesting case.\n");
    }

    let one_liner = theme.green(&format!(
        "→ {} input, classification: {}, entropy {:.2}\n",
        if analysis.length < 16 {
            "short"
        } else {
            "useful"
        },
        format_kind(&patterns.classification),
        metrics.entropy
    ));
    out.push('\n');
    out.push_str(&one_liner);
    out
}

fn row(theme: &Theme, label: &str, value: &str, width: usize) -> String {
    let inner = width - 4;
    let label_w = 16;
    let value_w = inner.saturating_sub(label_w + 1);
    let v = truncate(value, value_w);
    let padded = format!("{:<lw$} {:<vw$}", label, v, lw = label_w, vw = value_w);
    theme.cyan(&format!("║ {} ║\n", padded))
}

fn truncate(s: &str, n: usize) -> String {
    if s.chars().count() <= n {
        s.to_string()
    } else {
        let mut out: String = s.chars().take(n.saturating_sub(1)).collect();
        out.push('…');
        out
    }
}

fn format_ratio(r: f64) -> String {
    if r.is_infinite() {
        "∞ (all ones)".to_string()
    } else if r == 0.0 {
        "0 (no ones)".to_string()
    } else {
        format!("{:.3}", r)
    }
}

fn format_kind(k: &PatternKind) -> &'static str {
    match k {
        PatternKind::Alternating => "alternating",
        PatternKind::RunBased => "run-based",
        PatternKind::Mixed => "mixed",
        PatternKind::TooShort => "too short",
    }
}

pub fn format_json(
    input: &str,
    binary: &str,
    analysis: &BinaryAnalysis,
    metrics: &Metrics,
    patterns: &PatternReport,
) -> String {
    // Hand-rolled to avoid pulling in serde for this initial cut.
    let ratio = if analysis.ratio.is_infinite() {
        "null".to_string()
    } else {
        format!("{}", analysis.ratio)
    };
    let occ: Vec<String> = patterns
        .occurrences
        .iter()
        .map(|(k, v)| format!("    \"{}\": {}", escape_json(k), v))
        .collect();

    let blid = Blid::of_binary(binary);
    format!(
        "{{\n  \"input\": \"{}\",\n  \"binary\": \"{}\",\n  \"length\": {},\n  \"ones\": {},\n  \"zeros\": {},\n  \"ratio\": {},\n  \"entropy\": {},\n  \"longest_run\": {},\n  \"runs\": {},\n  \"alternating\": {},\n  \"burstiness\": {},\n  \"classification\": \"{}\",\n  \"blid\": \"{}\",\n  \"blid_sha256\": \"{}\",\n  \"occurrences\": {{\n{}\n  }}\n}}\n",
        escape_json(input),
        binary,
        analysis.length,
        analysis.ones,
        analysis.zeros,
        ratio,
        metrics.entropy,
        metrics.longest_run,
        metrics.runs,
        metrics.alternating,
        metrics.burstiness,
        format_kind(&patterns.classification),
        blid.short(),
        blid.full(),
        occ.join(",\n"),
    )
}

/// Format an interdimensional loop run as a table.
pub fn format_loop_table(run: &LoopRun, theme: &Theme) -> String {
    let mut out = String::new();
    out.push_str(&theme.bold("Interdimensional loop import — booLang-hardening study\n"));
    out.push_str(
        &theme
            .dim("  idx  vector            density   entropy   scalar        weighted      blid\n"),
    );
    for e in &run.entries {
        out.push_str(&format!(
            "  {:>3}  {:>8}/{:<8} {:>8.5}  {:>8.5}  {:>12}  {:>12.5}  {}\n",
            e.index,
            e.a,
            e.b,
            e.density,
            e.entropy,
            format!("{}", e.scalar),
            e.weighted,
            theme.green(&e.blid_short),
        ));
    }
    out.push('\n');
    out.push_str(&theme.bold(&format!(
        "run BLID: {}  ({} entries)\n",
        theme.green(&run.run_blid_short),
        run.entries.len()
    )));
    out.push_str(
        &theme.dim("two independent imports of the same study converge on this run BLID\n"),
    );
    out
}

/// Format an interdimensional loop run as JSON.
pub fn format_loop_json(run: &LoopRun) -> String {
    let entries: Vec<String> = run
        .entries
        .iter()
        .map(|e| {
            format!(
                "    {{\"index\": {}, \"vector\": [{}, {}], \"scalar\": {}, \"density\": {}, \"entropy\": {}, \"weighted\": {}, \"blid\": \"{}\"}}",
                e.index, e.a, e.b, e.scalar, e.density, e.entropy, e.weighted, e.blid_short
            )
        })
        .collect();
    format!(
        "{{\n  \"study\": \"booLang-hardening interdimensional loop\",\n  \"run_blid\": \"{}\",\n  \"run_blid_sha256\": \"{}\",\n  \"entries\": [\n{}\n  ]\n}}\n",
        run.run_blid_short,
        run.run_blid_full,
        entries.join(",\n")
    )
}

/// Escape a string for embedding in a JSON string literal.
/// Handles ALL control characters (U+0000..U+001F), not just newline —
/// a raw tab or carriage return in the output would make it invalid JSON.
fn escape_json(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '"' => out.push_str("\\\""),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out
}

/// Format the 45° walk + hydration as a table section.
pub fn format_walk_table(
    binary: &str,
    w: &Walk,
    h: &Hydration,
    verbose: bool,
    theme: &Theme,
) -> String {
    let mut out = String::new();
    out.push_str(&theme.bold("45° bipolar walk\n"));
    out.push_str(&format!(
        "  steps {}{}\n",
        w.steps,
        if w.odd_bit_dropped {
            "  (odd trailing bit dropped)"
        } else {
            ""
        }
    ));
    out.push_str(&format!(
        "  quarters  25%: {}   50%: {}   75%: {}   100%: {}\n",
        w.quarter_counts[0], w.quarter_counts[1], w.quarter_counts[2], w.quarter_counts[3]
    ));
    match (w.angle_deg, w.quarter) {
        (Some(a), Some(q)) => out.push_str(&format!(
            "  displacement ({}, {})  magnitude {:.4}  angle {:.1}°  → {}{}\n",
            w.x,
            w.y,
            w.magnitude,
            a,
            theme.green(&format!("{}%", q)),
            ""
        )),
        _ => out.push_str("  displacement (0, 0) — the walk returned home; no direction\n"),
    }

    out.push('\n');
    out.push_str(&theme.bold("Hydration (⅓ → H₂O)\n"));
    out.push_str(&format!(
        "  oxygen span   first {} of {} bits (×−2)\n",
        h.oxygen_len,
        binary.len()
    ));
    out.push_str(&format!(
        "  hydrogen span remaining {} bits (×+1)\n",
        h.hydrogen_len
    ));
    out.push_str(&format!("  raw charge      {:+}\n", h.raw_charge));
    out.push_str(&format!(
        "  hydrated charge {:+}  {}\n",
        h.hydrated_charge,
        if h.neutral {
            theme.green("⊜ neutral — water balance")
        } else {
            theme.yellow("structure survives the neutralization")
        }
    ));
    out.push_str(&format!("  correction      {:+}\n", h.correction));
    out.push_str(&format!("  overflow (i8)   {:+}\n", h.overflow_i8));

    if verbose {
        out.push('\n');
        out.push_str(&theme.dim("  Bipolar: 0→−1, 1→+1 — signed zero without zero; zero only\n"));
        out.push_str(&theme.dim("  emerges as a sum. Pairs step diagonally (axes rotated 45°);\n"));
        out.push_str(&theme.dim("  the four diagonals are the quarters 25/50/75/100%.\n"));
        out.push_str(&theme.dim("  Water weighting: H₂O = 1 O (−2) + 2 H (+1) = 0. A constant\n"));
        out.push_str(&theme.dim("  signal of length divisible by 3 neutralizes exactly; what\n"));
        out.push_str(&theme.dim("  survives measures structure against the third boundary.\n"));
    }
    out
}

/// Format walk + hydration as JSON.
pub fn format_walk_json(binary: &str, w: &Walk, h: &Hydration) -> String {
    let blid = Blid::of_binary(binary);
    let angle = match w.angle_deg {
        Some(a) => format!("{}", a),
        None => "null".to_string(),
    };
    let quarter = match w.quarter {
        Some(q) => format!("{}", q),
        None => "null".to_string(),
    };
    format!(
        "{{\n  \"binary\": \"{}\",\n  \"blid\": \"{}\",\n  \"walk\": {{\n    \"steps\": {},\n    \"odd_bit_dropped\": {},\n    \"x\": {},\n    \"y\": {},\n    \"magnitude\": {},\n    \"angle_deg\": {},\n    \"quarter\": {},\n    \"quarter_counts\": {{\"q25\": {}, \"q50\": {}, \"q75\": {}, \"q100\": {}}}\n  }},\n  \"hydration\": {{\n    \"raw_charge\": {},\n    \"hydrated_charge\": {},\n    \"correction\": {},\n    \"oxygen_len\": {},\n    \"hydrogen_len\": {},\n    \"overflow_i8\": {},\n    \"neutral\": {}\n  }}\n}}\n",
        binary,
        blid.short(),
        w.steps,
        w.odd_bit_dropped,
        w.x,
        w.y,
        w.magnitude,
        angle,
        quarter,
        w.quarter_counts[0],
        w.quarter_counts[1],
        w.quarter_counts[2],
        w.quarter_counts[3],
        h.raw_charge,
        h.hydrated_charge,
        h.correction,
        h.oxygen_len,
        h.hydrogen_len,
        h.overflow_i8,
        h.neutral,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn escape_json_handles_all_control_chars() {
        assert_eq!(escape_json("a\tb"), "a\\tb");
        assert_eq!(escape_json("a\rb"), "a\\rb");
        assert_eq!(escape_json("a\u{0001}b"), "a\\u0001b");
        assert_eq!(escape_json("a\"b\\c"), "a\\\"b\\\\c");
    }
}
