//! Output formatting. Two modes:
//!   - formal: clean Unicode-bordered tables, intentional color, learnable
//!   - json:   stable machine-readable JSON

use crate::binary::BinaryAnalysis;
use crate::blid::Blid;
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
