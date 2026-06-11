//! CLI argument parsing and help text. Pure functions so the unit tests
//! don't depend on `std::env`.

#[derive(Debug, Clone, PartialEq, Default)]
pub struct Options {
    pub help: bool,
    pub version: bool,
    pub retro: bool,
    pub json: bool,
    pub verbose: bool,
    pub demo: bool,
    pub no_color: bool,
    pub blid_only: bool,
    pub interloop: bool,
    pub input: Option<String>,
    pub unknown: Vec<String>,
}

pub fn parse(args: impl IntoIterator<Item = String>) -> Options {
    let mut opts = Options::default();
    let mut input_parts: Vec<String> = Vec::new();

    for tok in args {
        match tok.as_str() {
            "--help" | "-h" => opts.help = true,
            "--version" | "-V" => opts.version = true,
            "--retro" => opts.retro = true,
            "--json" => opts.json = true,
            "--verbose" | "-v" => opts.verbose = true,
            "--demo" => opts.demo = true,
            "--no-color" => opts.no_color = true,
            "--blid" => opts.blid_only = true,
            "--loop" => opts.interloop = true,
            s if s.starts_with("--") => opts.unknown.push(tok),
            s if s.starts_with('-')
                && s.len() > 1
                && !s[1..].chars().next().unwrap().is_ascii_digit() =>
            {
                opts.unknown.push(tok);
            }
            _ => input_parts.push(tok),
        }
    }

    if !input_parts.is_empty() {
        opts.input = Some(input_parts.join(" "));
    }
    if opts.json {
        opts.no_color = true;
    }
    opts
}

pub const HELP_TEXT: &str = "\
byteme — a playful binary string pattern analyzer

USAGE
  byteme [options] <input>

INPUT
  A binary string (e.g. \"01001000\") or any text — non-binary input is
  auto-encoded to UTF-8 bits before analysis.

OPTIONS
  -h, --help          Show this help and exit
  -V, --version       Print version and exit
      --retro         Play the AOL-era boot sequence before analysis
                      (matrix rain, fake BIOS, Windows 95 / Netscape gags)
      --json          Emit machine-readable JSON (implies --no-color)
  -v, --verbose       Include per-metric educational notes
      --demo          Run against a built-in fixture set instead of <input>
      --blid          Print only the BLID (content-addressed ID) of the
                      input's normalized bits — pipe-friendly
      --loop          Import the embedded interdimensional-loop study set
                      (32 vector/scalar pairs from booLang-hardening) and
                      report density, entropy, weighted score and BLID per
                      entry plus a collective run BLID
      --no-color      Disable ANSI colors (auto-off when not a TTY)

EXAMPLES
  byteme \"01001000 01101001\"     analyze a binary string
  byteme Hi                        auto-encode \"Hi\" → bits, then analyze
  byteme --verbose 11110000        analysis + plain-language explanations
  byteme --json 10101010 | jq .    pipe-safe JSON output
  byteme --blid Hi                 just the content-addressed ID
  byteme --loop --json             the loop study as JSON
  byteme --retro --demo            full retro showcase with fixtures

BLIDs
  A BLID identifies the *content* of an analysis: it is a versioned
  sha256 over the normalized bits. Two independent routes to the same
  bits converge on the same BLID — `byteme --blid Hi` equals
  `byteme --blid 0100100001101001`. Use BLIDs to deduplicate receipts,
  key caches, and verify that independent pipelines agree.

EXIT CODES
  0    success
  1    usage error
  2    invalid input
  130  interrupted (SIGINT)
";

#[cfg(test)]
mod tests {
    use super::*;

    fn parse_str(args: &[&str]) -> Options {
        parse(args.iter().map(|s| s.to_string()))
    }

    #[test]
    fn no_args_is_default() {
        let o = parse_str(&[]);
        assert!(!o.help && o.input.is_none());
    }

    #[test]
    fn help_flag() {
        assert!(parse_str(&["--help"]).help);
        assert!(parse_str(&["-h"]).help);
    }

    #[test]
    fn captures_input() {
        assert_eq!(parse_str(&["01010"]).input.as_deref(), Some("01010"));
    }

    #[test]
    fn joins_multi_word_input() {
        assert_eq!(
            parse_str(&["01", "10", "11"]).input.as_deref(),
            Some("01 10 11")
        );
    }

    #[test]
    fn json_forces_no_color() {
        let o = parse_str(&["--json", "01"]);
        assert!(o.json);
        assert!(o.no_color);
    }

    #[test]
    fn unknown_flags_collected_not_consumed_as_input() {
        let o = parse_str(&["--bogus", "01010"]);
        assert_eq!(o.unknown, vec!["--bogus"]);
        assert_eq!(o.input.as_deref(), Some("01010"));
    }

    #[test]
    fn combined_flags_and_input() {
        let o = parse_str(&["--retro", "--verbose", "Hello"]);
        assert!(o.retro && o.verbose);
        assert_eq!(o.input.as_deref(), Some("Hello"));
    }
}
