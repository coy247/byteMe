//! Narrator integration — complete-solution tests. The test spins its
//! own OpenAI-compatible mock server on a loopback port; nobody needs a
//! real LM Studio running, here or in CI. When the operator's Apple
//! Silicon box has Llama up, the same code path lights up against the
//! real endpoint.

use std::io::{Read, Write};
use std::net::TcpListener;
use std::process::Command;
use std::thread;

/// Minimal OpenAI-compatible mock: accepts one POST, asserts nothing
/// about it here (assertions happen in the test via the captured
/// request), responds with a canned chat completion.
fn spawn_mock(response_body: &'static str) -> (u16, thread::JoinHandle<String>) {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind loopback");
    let port = listener.local_addr().unwrap().port();
    let handle = thread::spawn(move || {
        let (mut sock, _) = listener.accept().expect("accept");
        let mut buf = [0u8; 65536];
        let mut req = Vec::new();
        // Read until the full body arrives (Content-Length framing).
        loop {
            let n = sock.read(&mut buf).expect("read");
            req.extend_from_slice(&buf[..n]);
            let text = String::from_utf8_lossy(&req);
            if let Some(h_end) = text.find("\r\n\r\n") {
                let cl = text
                    .lines()
                    .find(|l| l.to_ascii_lowercase().starts_with("content-length:"))
                    .and_then(|l| l.split(':').nth(1))
                    .and_then(|v| v.trim().parse::<usize>().ok())
                    .unwrap_or(0);
                if req.len() >= h_end + 4 + cl {
                    break;
                }
            }
            if n == 0 {
                break;
            }
        }
        let resp = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
            response_body.len(),
            response_body
        );
        sock.write_all(resp.as_bytes()).expect("write");
        String::from_utf8_lossy(&req).into_owned()
    });
    (port, handle)
}

#[test]
fn narration_end_to_end_against_mock_llama() {
    const CANNED: &str = r#"{"choices":[{"message":{"role":"assistant","content":"A perfectly alternating pulse — entropy 1.0, the most unpredictable two-symbol stream there is."}}]}"#;
    let (port, server) = spawn_mock(CANNED);

    let out = Command::new(env!("CARGO_BIN_EXE_byteme"))
        .args([
            "--narrate",
            "--endpoint",
            &format!("http://127.0.0.1:{}/v1/chat/completions", port),
            "--no-color",
            "0101",
        ])
        .output()
        .expect("binary runs");
    let stdout = String::from_utf8_lossy(&out.stdout);
    let request = server.join().expect("mock served");

    // The analysis itself printed…
    assert!(stdout.contains("ByteMe Analysis"));
    // …the narration arrived…
    assert!(stdout.contains("narrator"));
    assert!(stdout.contains("perfectly alternating pulse"));
    assert_eq!(out.status.code(), Some(0));

    // …and the request was a well-formed OpenAI chat call carrying the
    // real metrics (never invented ones).
    assert!(request.starts_with("POST /v1/chat/completions HTTP/1.1"));
    assert!(request.contains("\"stream\": false"));
    assert!(request.contains("\"messages\""));
    assert!(request.contains("Entropy: 1.0000 bits"));
    assert!(request.contains("Alternating: true"));
}

#[test]
fn narrator_offline_degrades_gracefully() {
    // Point at a port nobody listens on: the analysis must still
    // succeed (exit 0) with the dashboard-style warning on stderr.
    let out = Command::new(env!("CARGO_BIN_EXE_byteme"))
        .args([
            "--narrate",
            "--endpoint",
            "http://127.0.0.1:1/v1/chat/completions",
            "--no-color",
            "0101",
        ])
        .output()
        .expect("binary runs");
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);

    assert_eq!(out.status.code(), Some(0), "analysis must not fail");
    assert!(stdout.contains("ByteMe Analysis"));
    assert!(
        stderr.contains("narrator offline — narration unavailable"),
        "expected the dashboard-style warning, got:\n{}",
        stderr
    );
}

#[test]
fn endpoint_without_value_is_usage_error() {
    let out = Command::new(env!("CARGO_BIN_EXE_byteme"))
        .args(["--narrate", "0101", "--endpoint"])
        .output()
        .expect("binary runs");
    assert_eq!(out.status.code(), Some(1));
    assert!(String::from_utf8_lossy(&out.stderr).contains("--endpoint requires a value"));
}

#[test]
fn env_var_endpoint_is_respected() {
    const CANNED: &str = r#"{"choices":[{"message":{"content":"env route works"}}]}"#;
    let (port, server) = spawn_mock(CANNED);

    let out = Command::new(env!("CARGO_BIN_EXE_byteme"))
        .env(
            "BYTEME_NARRATOR",
            format!("http://127.0.0.1:{}/v1/chat/completions", port),
        )
        .args(["--narrate", "--no-color", "1100"])
        .output()
        .expect("binary runs");
    server.join().expect("mock served");
    assert!(String::from_utf8_lossy(&out.stdout).contains("env route works"));
}

#[test]
fn narration_never_fires_without_the_flag() {
    // No --narrate → no network attempt at all. We prove it by pointing
    // the env var at a dead port: if anything tried to connect, the
    // warning would appear on stderr. Silence = no attempt.
    let out = Command::new(env!("CARGO_BIN_EXE_byteme"))
        .env("BYTEME_NARRATOR", "http://127.0.0.1:1/x")
        .args(["--no-color", "0101"])
        .output()
        .expect("binary runs");
    assert_eq!(out.status.code(), Some(0));
    assert!(String::from_utf8_lossy(&out.stderr).is_empty());
}
