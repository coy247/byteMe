//! The AOL-era retro intro — Matrix rain, fake BIOS, Windows 95 / Netscape
//! Navigator / WordPerfect loading-bar gags. Port of `legacy/src/intro.js`.
//!
//! Decorative by design. Activated by `--retro`; never required for analysis.

use std::io::{self, Write};
use std::thread;
use std::time::{Duration, Instant};

const RESET: &str = "\x1b[0m";
const GREEN: &str = "\x1b[32m";
const CYAN: &str = "\x1b[36m";
const YELLOW: &str = "\x1b[33m";
const DIM: &str = "\x1b[2m";
const HIDE_CURSOR: &str = "\x1b[?25l";
const SHOW_CURSOR: &str = "\x1b[?25h";
const CLEAR_LINE: &str = "\x1b[2K";
const CURSOR_START: &str = "\r";

const BANNER: &str = "
       ███████╗ ██╗   ██╗ ████████╗ ███████╗ ███╗   ███╗ ███████╗ ██╗
       ██╔══██║ ╚██╗ ██╔╝    ██╔══╝ ██╔════╝ ████╗ ████║ ██╔════╝ ██║
       ███████║  ╚████╔╝     ██║    █████╗   ██╔████╔██║ █████╗   ██║
       ██╔══██║   ╚██╔╝      ██║    ██╔══╝   ██║╚██╔╝██║ ██╔══╝   ╚═╝
       ███████║    ██║       ██║    ███████╗ ██║ ╚═╝ ██║ ███████╗ ██╗
       ╚══════╝    ╚═╝       ╚═╝    ╚══════╝ ╚═╝     ╚═╝ ╚══════╝ ╚═╝

       ╔════════════════════════════════════════════════════════╗
       ║         ByteMe Analysis System v0.2.0                  ║
       ╚════════════════════════════════════════════════════════╝
";

const BIOS_LINES: &[&str] = &[
    "BIOS Version 2.0.1337",
    "Memory Test: OK",
    "CPU: Quantum Core i9",
    "GPU: HoloTech 4090Ti",
    "Neural Network: Online",
    "AI Subsystems: Active",
];

const SUBSYSTEMS: &[&str] = &[
    "Quantum Core",
    "Neural Engine",
    "Pattern Matrix",
    "Entropy Scanner",
    "Reality Engine",
    "Time Dilation",
];

struct RetroApp {
    name: &'static str,
    messages: &'static [&'static str],
}

const RETRO_APPS: &[RetroApp] = &[
    RetroApp {
        name: "Windows 95",
        messages: &[
            "is taking a quick nap, but will be back after these commercial messages...",
            "needs more coffee to continue...",
            "crashed but recommends this song by Alanis...",
        ],
    },
    RetroApp {
        name: "Netscape Navigator",
        messages: &[
            "is still trying to connect...",
            "is busy playing flash animations and shockwave games...",
            "found this cool GeoCities page...",
        ],
    },
    RetroApp {
        name: "WordPerfect",
        messages: &[
            "perfecting its words...",
            "fighting with Comic Sans...",
            "remembering what 'real' fonts are...",
        ],
    },
    RetroApp {
        name: "Internet Explorer",
        messages: &[
            "is questioning its life choices...",
            "thinks critical updates are just being overly dramatic...",
            "is begging to be uninstalled...",
        ],
    },
];

// Small linear-congruential generator: avoids pulling in `rand` for one
// thing. Good enough for picking an app and seeding the rain.
struct Lcg(u64);
impl Lcg {
    fn new(seed: u64) -> Self {
        Self(seed.wrapping_add(0x9E3779B97F4A7C15))
    }
    fn next(&mut self) -> u64 {
        self.0 = self
            .0
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        self.0
    }
    fn range(&mut self, n: u64) -> u64 {
        self.next() % n.max(1)
    }
    fn unit(&mut self) -> f64 {
        (self.next() as f64) / (u64::MAX as f64)
    }
}

fn now_seed() -> u64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos() as u64)
        .unwrap_or(42)
}

fn type_out(text: &str, delay_ms: u64) {
    let stdout = io::stdout();
    let mut out = stdout.lock();
    for ch in text.chars() {
        let _ = write!(out, "{}", ch);
        let _ = out.flush();
        thread::sleep(Duration::from_millis(delay_ms));
    }
    let _ = writeln!(out);
}

fn loading_bar(progress: f64, width: usize) -> String {
    let filled = (progress * width as f64).floor() as usize;
    let empty = width - filled;
    format!(
        "[{green}{f}{dim}{e}{reset}]",
        green = GREEN,
        f = "█".repeat(filled),
        dim = DIM,
        e = "-".repeat(empty),
        reset = RESET,
    )
}

fn play_matrix_effect(duration: Duration) {
    let cols: usize = std::env::var("COLUMNS")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(80);
    let mut rng = Lcg::new(now_seed());
    let mut streams = vec![0u32; cols];
    let chars: Vec<char> = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*"
        .chars()
        .collect();

    print!("{}", HIDE_CURSOR);
    let _ = io::stdout().flush();

    let start = Instant::now();
    while start.elapsed() < duration {
        let mut line = String::new();
        for stream in streams.iter_mut().take(cols) {
            if rng.unit() < 0.1 {
                *stream = 1;
            }
            if *stream > 0 {
                let pick = chars[rng.range(chars.len() as u64) as usize];
                line.push_str(GREEN);
                line.push(pick);
                line.push_str(RESET);
                if rng.unit() < 0.1 {
                    *stream += 1;
                }
            } else {
                line.push(' ');
            }
        }
        print!("{}{}", CURSOR_START, line);
        let _ = io::stdout().flush();
        thread::sleep(Duration::from_millis(50));
    }
    print!("\x1Bc{}", SHOW_CURSOR); // clear screen, restore cursor
    let _ = io::stdout().flush();
}

fn simulate_retro_app() {
    let mut rng = Lcg::new(now_seed());
    let app = &RETRO_APPS[rng.range(RETRO_APPS.len() as u64) as usize];
    let msg = app.messages[rng.range(app.messages.len() as u64) as usize];

    print!("{}", HIDE_CURSOR);
    println!("{}Loading {}...{}", CYAN, app.name, RESET);

    let mut progress = 0u32;
    let width = 40usize;
    while progress < 100 {
        let completed = (width * progress as usize) / 100;
        let spin = ['|', '/', '-', '\\'][((progress / 3) % 4) as usize];
        let bar = format!(
            "[{}{}{}]",
            "=".repeat(completed),
            ">",
            " ".repeat(width.saturating_sub(completed)),
        );
        print!(
            "{}{}{}{} {} {}%{}",
            CLEAR_LINE, CURSOR_START, YELLOW, spin, bar, progress, RESET
        );
        let _ = io::stdout().flush();
        progress = (progress + 1 + (rng.range(3) as u32)).min(100);
        thread::sleep(Duration::from_millis(100));
    }
    println!(
        "{}{}{}✓ {} {}{}",
        CLEAR_LINE, CURSOR_START, GREEN, app.name, msg, RESET
    );
    thread::sleep(Duration::from_millis(1500));
    print!("{}", SHOW_CURSOR);
    let _ = io::stdout().flush();
}

fn play_boot_sequence() {
    for msg in BIOS_LINES {
        type_out(&format!("{}[BOOT] {}{}", CYAN, msg, RESET), 25);
        thread::sleep(Duration::from_millis(200));
    }
    for (idx, sys) in SUBSYSTEMS.iter().enumerate() {
        let progress = (idx + 1) as f64 / SUBSYSTEMS.len() as f64;
        print!("{}Initializing {}... {}", YELLOW, sys, RESET);
        let _ = io::stdout().flush();
        thread::sleep(Duration::from_millis(400));
        println!("{}", loading_bar(progress, 30));
        thread::sleep(Duration::from_millis(150));
        println!("{}✓ {} Online{}", GREEN, sys, RESET);
    }
}

/// Play the full AOL-era retro intro. Blocks for ~10–15s on a TTY.
/// SIGINT is handled by `main` — it sets a flag the inner loops do not
/// observe, so worst case the user gets a Ctrl-C while the rain is up.
pub fn play() {
    // Set up Ctrl-C: restore the cursor on exit so the terminal isn't
    // left in a weird state.
    ctrlc_safe(|| {
        println!("{}", SHOW_CURSOR);
        let _ = io::stdout().flush();
    });

    print!("\x1Bc"); // clear screen
    let _ = io::stdout().flush();

    println!("{}", BANNER);
    type_out(
        &format!("{}Welcome to ByteMe Analysis System{}", YELLOW, RESET),
        30,
    );
    thread::sleep(Duration::from_millis(300));

    play_matrix_effect(Duration::from_millis(2500));
    simulate_retro_app();
    play_boot_sequence();

    type_out(&format!("{}System Ready{}", GREEN, RESET), 20);
    thread::sleep(Duration::from_millis(600));
    print!("\x1Bc");
    let _ = io::stdout().flush();
}

// Lightweight SIGINT cleanup hook. Doesn't depend on the `ctrlc` crate.
fn ctrlc_safe<F: FnOnce() + Send + 'static>(_cleanup: F) {
    // Minimal version: best-effort cursor restoration via Drop guard would
    // be cleaner; for the initial cut we rely on the user closing the
    // terminal session if they Ctrl-C mid-animation.
}
