use byteme::{
    binary::BinaryModel,
    blid::Blid,
    cli::{self, Options, HELP_TEXT},
    encode, hydro, interloop, intro, metrics,
    output::{self, Theme},
    patterns, VERSION,
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
    }

    let theme = Theme {
        color: !opts.no_color,
    };

    if opts.interloop {
        let run = interloop::study_run();
        if opts.json {
            print!("{}", output::format_loop_json(&run));
        } else {
            print!("{}", output::format_loop_table(&run, &theme));
        }
        return ExitCode::SUCCESS;
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

    match run_once(input, &opts, &theme) {
        Ok(()) => ExitCode::SUCCESS,
        Err(code) => code,
    }
}

fn run_once(input: &str, opts: &Options, theme: &Theme) -> Result<(), ExitCode> {
    let binary = encode::to_binary(input);
    let model = BinaryModel::new(binary.clone());
    let Some(analysis) = model.analyze() else {
        eprintln!(
            "error: input '{}' did not produce a valid binary string",
            input
        );
        return Err(ExitCode::from(2));
    };

    if opts.blid_only {
        println!("{}", Blid::of_binary(&binary).short());
        return Ok(());
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
    Ok(())
}
