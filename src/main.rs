use byteme::{
    binary::BinaryModel,
    canon::{self, Ingested},
    cli::{self, Options, HELP_TEXT},
    concert, contact, hydro, intro, metrics, narrate,
    output::{self, Theme},
    patterns, study, szero, VERSION,
};
use std::io::IsTerminal;
use std::process::ExitCode;

const DEMO_INPUTS: &[&str] = &["1010101010", "11110000", "10011001"];

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let mut opts = cli::parse(args);

    // Auto-disable color if not a TTY (e.g. piped to a file).
    if !std::io::stdout().is_terminal() {
        opts.no_color = true;
    }

    if !opts.unknown.is_empty() {
        eprintln!("Unknown options: {}", opts.unknown.join(", "));
        eprintln!("Run `byteme --help` for usage.");
        return ExitCode::from(1);
    }
    if opts.key_missing_value {
        eprintln!("error: --key requires a value");
        return ExitCode::from(1);
    }
    if opts.endpoint_missing_value {
        eprintln!("error: --endpoint requires a value");
        return ExitCode::from(1);
    }

    if opts.help {
        print!("{}", HELP_TEXT);
        return ExitCode::SUCCESS;
    }
    if opts.version {
        println!("byteme {}", VERSION);
        return ExitCode::SUCCESS;
    }

    if opts.retro {
        intro::play();
        // `byteme --retro` alone IS the introduction — the AOL-era boot
        // sequence as a standalone experience (the Rust heir of the
        // original `npm run intro`). Exit cleanly instead of demanding
        // an input that was never the point.
        if opts.input.is_none() && !opts.demo && !opts.interloop {
            return ExitCode::SUCCESS;
        }
    }

    let theme = Theme {
        color: !opts.no_color,
    };

    if opts.interloop {
        let run = study::study_run();
        if opts.blid_only {
            // Compact exchange: the run BLID IS the message. Any
            // implementation (any language, any machine code) that
            // reproduces the canonical recipe from its own copy of the
            // study converges on this line.
            match &opts.key {
                Some(k) => println!("{}", run.keyed_run_blid(k).short()),
                None => println!("{}", run.run_blid_short),
            }
        } else if opts.json {
            print!("{}", output::format_loop_json(&run));
        } else {
            print!("{}", output::format_loop_table(&run, &theme));
        }
        return ExitCode::SUCCESS;
    }

    if opts.contact {
        let reading = contact::read_study();
        if opts.blid_only {
            match &opts.key {
                Some(k) => println!("{}", contact::reading_blid(&reading, Some(k)).short()),
                None => println!("{}", contact::reading_blid(&reading, None).short()),
            }
        } else {
            print!("{}", contact::verdict(&reading));
        }
        return ExitCode::SUCCESS;
    }

    if opts.signed_zero {
        return run_signed_zero(opts.input.as_deref(), &opts, &theme);
    }

    if opts.demo {
        for input in DEMO_INPUTS {
            match run_once(input, &opts, &theme) {
                Ok(()) => {}
                Err(code) => return code,
            }
            println!();
        }
        return ExitCode::SUCCESS;
    }

    let Some(input) = opts.input.as_deref() else {
        eprintln!("error: no input provided");
        eprintln!("Run `byteme --help` for usage.");
        return ExitCode::from(1);
    };

    if opts.concert {
        return run_concert(input, &opts, &theme);
    }

    match run_once(input, &opts, &theme) {
        Ok(()) => ExitCode::SUCCESS,
        Err(code) => code,
    }
}

/// Join several whitespace-separated buckets into one concert identity.
/// Each token is a bucket: `a/b` → an exact reduced ratio; otherwise the
/// token is ingested (bits stay bits, numbers/text become their bits).
fn run_concert(input: &str, opts: &Options, theme: &Theme) -> ExitCode {
    use byteme::rational::Rational;
    let mut buckets = Vec::new();
    for tok in input.split_whitespace() {
        if let Some((n, d)) = tok.split_once('/') {
            match (n.parse::<i128>(), d.parse::<i128>()) {
                (Ok(n), Ok(d)) => match Rational::new(n, d) {
                    Some(r) => buckets.push(concert::Bucket::Ratio(r)),
                    None => {
                        eprintln!("error: bucket '{}' has zero denominator", tok);
                        return ExitCode::from(2);
                    }
                },
                _ => {
                    eprintln!("error: bucket '{}' is not a valid a/b ratio", tok);
                    return ExitCode::from(2);
                }
            }
        } else {
            match canon::ingest(tok) {
                Ok(i) => buckets.push(concert::Bucket::Bits(i.bits().to_string())),
                Err(e) => {
                    eprintln!("error: bucket '{}': {}", tok, e);
                    return ExitCode::from(2);
                }
            }
        }
    }
    match concert::concert_blid(&buckets, opts.key.as_deref()) {
        Ok(blid) => {
            if opts.blid_only {
                println!("{}", blid.short());
            } else {
                println!(
                    "{}",
                    theme.bold(&format!("concert of {} buckets", buckets.len()))
                );
                println!("BLID: {}", theme.green(blid.short()));
                println!(
                    "{}",
                    theme.dim("all bits work in concert; dimensions reconciled via LCM")
                );
            }
            ExitCode::SUCCESS
        }
        Err(e) => {
            eprintln!("error: {}", e);
            ExitCode::from(2)
        }
    }
}

/// Signed-zero rotational-channel corridor (Radio Shack v2.9.1).
/// Optional input: phase numbers like "1 3", with an optional leading
/// "z4"/"z8" token to pick the ring. No input → the canonical doctrine
/// vector (two -0 witnesses at phases 1 and 3 in Z4 → +0 at ground).
fn run_signed_zero(input: Option<&str>, opts: &Options, theme: &Theme) -> ExitCode {
    let mut modulus = szero::Z4;
    let mut phases: Vec<u8> = Vec::new();
    if let Some(s) = input {
        for tok in s.split_whitespace() {
            match tok {
                "z4" | "Z4" => modulus = szero::Z4,
                "z8" | "Z8" => modulus = szero::Z8,
                _ => match tok.parse::<u8>() {
                    Ok(p) => phases.push(p),
                    Err(_) => {
                        eprintln!("error: '{}' is not a phase number or z4/z8", tok);
                        return ExitCode::from(2);
                    }
                },
            }
        }
    }
    if phases.is_empty() {
        phases = vec![1, 3]; // the canonical doctrine vector
    }

    let steps = szero::corridor(&phases, modulus);
    // The emerging channel: last transport's output, or the seed channel
    // when there was nothing to compose.
    let out = steps
        .last()
        .map(|t| t.out)
        .unwrap_or_else(|| szero::Channel::neg_zero(phases[0], modulus));

    if opts.blid_only {
        let blid = match steps.last() {
            Some(t) => match &opts.key {
                Some(k) => crate_blid_keyed(k, &t.canonical()),
                None => t.blid(),
            },
            None => out.blid(),
        };
        println!("{}", blid.short());
        return ExitCode::SUCCESS;
    }

    if opts.json {
        print!("{}", szero_json(&phases, modulus, &steps, &out));
        return ExitCode::SUCCESS;
    }

    // PASILLO view: tick by tick with real BLIDs.
    println!(
        "{}",
        theme.bold(&format!(
            "signed-zero corridor — Z{} (Radio Shack v2.9.1)",
            modulus
        ))
    );
    println!(
        "{}",
        theme.dim("two -0 witnesses compose to +0: sign = XOR, phase adds in Z_N")
    );
    let seed = szero::Channel::neg_zero(phases[0], modulus);
    println!(
        "  seed   {} {}",
        channel_glyph(&seed),
        theme.dim(seed.blid().short())
    );
    let mut acc_phase = phases[0];
    for (i, t) in steps.iter().enumerate() {
        acc_phase = t.out.phase;
        println!(
            "  T{:<2}    × -0@{}  ->  {}  z{}:[{},{}]->{}  {}",
            i + 1,
            t.in_b.phase,
            channel_glyph(&t.out),
            modulus,
            t.in_a.phase,
            t.in_b.phase,
            t.out.phase,
            theme.dim(t.blid().short()),
        );
    }
    let _ = acc_phase;
    let landing = if out.is_pure_rotation() && out.phase == 0 && out.sign == szero::Sign::Plus {
        theme.green("+0 at ground (primary axis) — the witnesses cancelled")
    } else {
        theme.yellow(&format!(
            "{} @ phase {} ({})",
            if out.sign == szero::Sign::Plus {
                "+"
            } else {
                "-"
            },
            out.phase,
            chirality_label(&out),
        ))
    };
    println!("  out    {}", landing);
    ExitCode::SUCCESS
}

fn channel_glyph(c: &szero::Channel) -> String {
    let s = if c.sign == szero::Sign::Plus {
        "+"
    } else {
        "-"
    };
    format!("{}{}@{}", s, c.magnitude.canonical(), c.phase)
}

fn chirality_label(c: &szero::Channel) -> &'static str {
    match c.chirality() {
        szero::Chirality::Absolute => "absolute",
        szero::Chirality::Forward => "forward",
        szero::Chirality::Witness => "witness",
    }
}

fn crate_blid_keyed(key: &str, record: &str) -> byteme::blid::Blid {
    byteme::blid::Blid::keyed_of_record(key, record)
}

fn szero_json(
    phases: &[u8],
    modulus: u8,
    steps: &[szero::Transport],
    out: &szero::Channel,
) -> String {
    let mut s = String::from("{\n");
    s.push_str(&format!("  \"ring\": \"Z{}\",\n", modulus));
    s.push_str(&format!(
        "  \"phases\": [{}],\n",
        phases
            .iter()
            .map(|p| p.to_string())
            .collect::<Vec<_>>()
            .join(", ")
    ));
    s.push_str("  \"steps\": [\n");
    let step_lines: Vec<String> = steps
        .iter()
        .map(|t| {
            format!(
                "    {{\"in_a_phase\": {}, \"in_b_phase\": {}, \"out_phase\": {}, \"out_sign\": \"{}\", \"blid\": \"{}\"}}",
                t.in_a.phase,
                t.in_b.phase,
                t.out.phase,
                if t.out.sign == szero::Sign::Plus { "+" } else { "-" },
                t.blid().short(),
            )
        })
        .collect();
    s.push_str(&step_lines.join(",\n"));
    s.push_str("\n  ],\n");
    s.push_str(&format!(
        "  \"out\": {{\"sign\": \"{}\", \"magnitude\": \"{}\", \"phase\": {}, \"chirality\": \"{}\", \"blid\": \"{}\"}}\n",
        if out.sign == szero::Sign::Plus { "+" } else { "-" },
        out.magnitude.canonical(),
        out.phase,
        chirality_label(out),
        out.blid().short(),
    ));
    s.push_str("}\n");
    s
}

fn run_once(input: &str, opts: &Options, theme: &Theme) -> Result<(), ExitCode> {
    let ingested = match canon::ingest(input) {
        Ok(i) => i,
        Err(e) => {
            eprintln!("error: {}", e);
            return Err(ExitCode::from(2));
        }
    };
    let binary = ingested.bits().to_string();
    let model = BinaryModel::new(binary.clone());
    let Some(analysis) = model.analyze() else {
        eprintln!(
            "error: input '{}' did not produce a valid binary string",
            input
        );
        return Err(ExitCode::from(2));
    };

    if opts.blid_only {
        match &opts.key {
            Some(k) => println!("{}", ingested.blid_keyed(k).short()),
            None => println!("{}", ingested.blid().short()),
        }
        return Ok(());
    }

    // For non-bit kinds, surface the canonical interpretation before the
    // bit-level analysis so the exactness is visible.
    if !opts.json {
        match &ingested {
            Ingested::Int { value, naf, .. } => {
                println!(
                    "{}",
                    theme.dim(&format!(
                        "kind: int   value: {}   NAF: {}",
                        value,
                        canon::naf_formula(naf)
                    ))
                );
            }
            Ingested::Array { values, .. } => {
                println!(
                    "{}",
                    theme.dim(&format!(
                        "kind: array   {} elements: {:?}",
                        values.len(),
                        values
                    ))
                );
            }
            _ => {}
        }
    }

    if opts.walk {
        let w = hydro::walk(&binary);
        let h = hydro::hydrate(&binary);
        if opts.json {
            print!("{}", output::format_walk_json(&binary, &w, &h));
        } else {
            print!(
                "{}",
                output::format_walk_table(&binary, &w, &h, opts.verbose, theme)
            );
        }
        return Ok(());
    }
    let m = metrics::compute(&binary);
    let p = patterns::report(&binary);

    if opts.json {
        print!("{}", output::format_json(input, &binary, &analysis, &m, &p));
    } else {
        print!(
            "{}",
            output::format_report(input, &binary, &analysis, &m, &p, opts.verbose, theme)
        );
    }

    if opts.narrate {
        let endpoint = narrate::resolve_endpoint(opts.endpoint.as_deref());
        let summary = format!(
            "Input: {}. Binary ({} bits): {}. Ones: {}, zeros: {}. \
             Entropy: {:.4} bits. Longest run: {}. Distinct runs: {}. \
             Alternating: {}. Burstiness: {:.4}. Classification: {:?}.",
            input,
            analysis.length,
            if binary.len() > 64 {
                &binary[..64]
            } else {
                &binary
            },
            analysis.ones,
            analysis.zeros,
            m.entropy,
            m.longest_run,
            m.runs,
            m.alternating,
            m.burstiness,
            p.classification,
        );
        match narrate::narrate(&endpoint, &summary) {
            Ok(text) => {
                println!("\n{}", theme.bold("🦙 narrator"));
                println!("{}", text.trim());
            }
            Err(e) => {
                // Narration is decoration: the analysis above already
                // succeeded, so this is a warning, not a failure.
                eprintln!("warning: {}", e);
            }
        }
    }
    Ok(())
}
