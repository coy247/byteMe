//! Local-LLM narrator: send the analysis to a Meta Llama model served on
//! the operator's own hardware (Ollama on Apple Silicon — lightweight
//! daemon, not a GUI app) via the OpenAI-compatible chat-completions
//! endpoint, and print the returned narration.
//!
//! Design constraints, in order:
//! - **Local-only by default.** Default endpoint is Ollama's
//!   `http://localhost:11434/v1/chat/completions` — chosen over LM
//!   Studio (a memory-hungry Electron app that slows the host machine).
//!   Nothing is sent anywhere unless the operator passes `--narrate`;
//!   the analysis never requires it. Narration is decoration, exactly
//!   like the retro intro.
//! - **Cloud-capable when needed.** `--endpoint <url>` or
//!   `BYTEME_NARRATOR` point at any OpenAI-compatible endpoint
//!   (api.openai.com, Anthropic-compatible proxies, etc.). Local is the
//!   default because cloud is rarely necessary for narration.
//! - **Zero dependencies.** A hand-rolled HTTP/1.1 client over
//!   `std::net::TcpStream` — plain `http://` only, which is correct for
//!   a loopback endpoint. Cloud endpoints typically require `https://`,
//!   which this client deliberately rejects: TLS would pull in a
//!   dependency just to talk to a remote service that is itself optional.
//!   If you need cloud, terminate TLS locally (a tiny proxy on
//!   loopback) and point `--endpoint` at that.
//! - **Graceful offline.** If the narrator is unreachable the analysis
//!   still succeeds (exit 0) and stderr reports
//!   `narrator offline — narration unavailable`, echoing the dashboard
//!   convention this feature descends from.
//!
//! Delimited: response parsing extracts the first `"content"` string
//! after `"message"` — sufficient for OpenAI-compatible servers, not a
//! general JSON parser. Streaming responses are not requested
//! (`"stream": false`) and not supported.

use std::io::{Read, Write};
use std::net::TcpStream;
use std::time::Duration;

pub const DEFAULT_ENDPOINT: &str = "http://localhost:11434/v1/chat/completions";
pub const ENDPOINT_ENV: &str = "BYTEME_NARRATOR";

const CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
// Local models can take a while on first token; generous but bounded.
const IO_TIMEOUT: Duration = Duration::from_secs(120);

const SYSTEM_PROMPT: &str = "You are the ByteMe narrator. You receive a \
binary pattern analysis and explain what it means in two or three plain, \
vivid sentences a curious learner would enjoy. Mention the most \
interesting metric. Never invent numbers that are not in the input.";

#[derive(Debug)]
pub enum NarrateError {
    BadEndpoint(String),
    Unreachable(String),
    Protocol(String),
}

impl std::fmt::Display for NarrateError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            NarrateError::BadEndpoint(e) => write!(f, "bad endpoint: {}", e),
            NarrateError::Unreachable(e) => {
                write!(f, "narrator offline — narration unavailable ({})", e)
            }
            NarrateError::Protocol(e) => write!(f, "narrator protocol error: {}", e),
        }
    }
}

struct Endpoint {
    host: String,
    port: u16,
    path: String,
}

fn parse_endpoint(url: &str) -> Result<Endpoint, NarrateError> {
    let rest = url.strip_prefix("http://").ok_or_else(|| {
        NarrateError::BadEndpoint(format!("only http:// is supported (loopback use): {}", url))
    })?;
    let (authority, path) = match rest.find('/') {
        Some(i) => (&rest[..i], rest[i..].to_string()),
        None => (rest, "/".to_string()),
    };
    let (host, port) = match authority.rfind(':') {
        Some(i) => {
            let p: u16 = authority[i + 1..]
                .parse()
                .map_err(|_| NarrateError::BadEndpoint(format!("bad port in {}", url)))?;
            (authority[..i].to_string(), p)
        }
        None => (authority.to_string(), 80),
    };
    if host.is_empty() {
        return Err(NarrateError::BadEndpoint(format!("empty host in {}", url)));
    }
    Ok(Endpoint { host, port, path })
}

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

/// Decode a JSON string literal starting at `bytes[start]` == b'"'.
/// Returns the decoded string. Handles the standard escapes and \uXXXX
/// (surrogate pairs for completeness).
fn decode_json_string(bytes: &[u8], start: usize) -> Option<String> {
    debug_assert_eq!(bytes.get(start), Some(&b'"'));
    let mut out = String::new();
    let mut i = start + 1;
    let mut pending_high: Option<u16> = None;
    while i < bytes.len() {
        match bytes[i] {
            b'"' => return Some(out),
            b'\\' => {
                i += 1;
                match bytes.get(i)? {
                    b'"' => out.push('"'),
                    b'\\' => out.push('\\'),
                    b'/' => out.push('/'),
                    b'n' => out.push('\n'),
                    b't' => out.push('\t'),
                    b'r' => out.push('\r'),
                    b'b' => out.push('\u{0008}'),
                    b'f' => out.push('\u{000C}'),
                    b'u' => {
                        let hex = std::str::from_utf8(bytes.get(i + 1..i + 5)?).ok()?;
                        let cu = u16::from_str_radix(hex, 16).ok()?;
                        i += 4;
                        if (0xD800..0xDC00).contains(&cu) {
                            pending_high = Some(cu);
                        } else if (0xDC00..0xE000).contains(&cu) {
                            if let Some(hi) = pending_high.take() {
                                let c =
                                    0x10000 + ((hi as u32 - 0xD800) << 10) + (cu as u32 - 0xDC00);
                                out.push(char::from_u32(c)?);
                            }
                        } else {
                            out.push(char::from_u32(cu as u32)?);
                        }
                    }
                    _ => return None,
                }
                i += 1;
            }
            b => {
                // Copy the full UTF-8 sequence.
                let len = match b {
                    0x00..=0x7F => 1,
                    0xC0..=0xDF => 2,
                    0xE0..=0xEF => 3,
                    _ => 4,
                };
                let chunk = bytes.get(i..i + len)?;
                out.push_str(std::str::from_utf8(chunk).ok()?);
                i += len;
            }
        }
    }
    None
}

/// Extract the assistant text from an OpenAI-style chat response: the
/// first "content" string after "message" (fallback: first "content").
fn extract_content(body: &str) -> Option<String> {
    let bytes = body.as_bytes();
    let anchor = body.find("\"message\"").unwrap_or(0);
    let rel = body[anchor..].find("\"content\"")?;
    let after_key = anchor + rel + "\"content\"".len();
    let colon = body[after_key..].find(':')? + after_key;
    let quote = body[colon..].find('"')? + colon;
    decode_json_string(bytes, quote)
}

/// Decode an HTTP body that may be Content-Length-framed, chunked, or
/// closed-delimited.
fn decode_http_body(headers: &str, raw_body: &[u8]) -> Result<Vec<u8>, NarrateError> {
    let lower = headers.to_ascii_lowercase();
    if lower.contains("transfer-encoding: chunked") {
        let mut out = Vec::new();
        let mut i = 0usize;
        loop {
            let line_end = raw_body[i..]
                .windows(2)
                .position(|w| w == b"\r\n")
                .ok_or_else(|| NarrateError::Protocol("truncated chunk header".into()))?
                + i;
            let size_str = std::str::from_utf8(&raw_body[i..line_end])
                .map_err(|_| NarrateError::Protocol("bad chunk size".into()))?
                .trim()
                .split(';')
                .next()
                .unwrap_or("0");
            let size = usize::from_str_radix(size_str, 16)
                .map_err(|_| NarrateError::Protocol("bad chunk size".into()))?;
            if size == 0 {
                return Ok(out);
            }
            let start = line_end + 2;
            let end = start + size;
            out.extend_from_slice(
                raw_body
                    .get(start..end)
                    .ok_or_else(|| NarrateError::Protocol("truncated chunk".into()))?,
            );
            i = end + 2; // skip trailing CRLF
        }
    }
    Ok(raw_body.to_vec())
}

/// Send the analysis summary to the narrator endpoint; return the
/// narration text.
pub fn narrate(endpoint_url: &str, summary: &str) -> Result<String, NarrateError> {
    let ep = parse_endpoint(endpoint_url)?;

    let body = format!(
        "{{\"model\": \"local\", \"stream\": false, \"temperature\": 0.7, \
         \"max_tokens\": 300, \"messages\": [\
         {{\"role\": \"system\", \"content\": \"{}\"}}, \
         {{\"role\": \"user\", \"content\": \"{}\"}}]}}",
        escape_json(SYSTEM_PROMPT),
        escape_json(summary)
    );
    let request = format!(
        "POST {} HTTP/1.1\r\nHost: {}:{}\r\nContent-Type: application/json\r\n\
         Content-Length: {}\r\nConnection: close\r\nAccept: application/json\r\n\r\n{}",
        ep.path,
        ep.host,
        ep.port,
        body.len(),
        body
    );

    let addr = format!("{}:{}", ep.host, ep.port);
    let sock_addr = std::net::ToSocketAddrs::to_socket_addrs(&addr)
        .map_err(|e| NarrateError::Unreachable(e.to_string()))?
        .next()
        .ok_or_else(|| NarrateError::Unreachable(format!("no address for {}", addr)))?;
    let mut stream = TcpStream::connect_timeout(&sock_addr, CONNECT_TIMEOUT)
        .map_err(|e| NarrateError::Unreachable(e.to_string()))?;
    stream.set_read_timeout(Some(IO_TIMEOUT)).ok();
    stream.set_write_timeout(Some(IO_TIMEOUT)).ok();
    stream
        .write_all(request.as_bytes())
        .map_err(|e| NarrateError::Unreachable(e.to_string()))?;

    let mut response = Vec::new();
    stream
        .read_to_end(&mut response)
        .map_err(|e| NarrateError::Unreachable(e.to_string()))?;

    let split = response
        .windows(4)
        .position(|w| w == b"\r\n\r\n")
        .ok_or_else(|| NarrateError::Protocol("no header/body boundary".into()))?;
    let headers = String::from_utf8_lossy(&response[..split]).into_owned();
    let status = headers.lines().next().unwrap_or("");
    if !status.contains("200") {
        return Err(NarrateError::Protocol(format!("status: {}", status)));
    }
    let body_bytes = decode_http_body(&headers, &response[split + 4..])?;
    let body_str = String::from_utf8_lossy(&body_bytes);
    extract_content(&body_str)
        .ok_or_else(|| NarrateError::Protocol("no content field in response".into()))
}

/// Resolve the endpoint: explicit flag > env var > Ollama default.
pub fn resolve_endpoint(flag: Option<&str>) -> String {
    if let Some(e) = flag {
        return e.to_string();
    }
    std::env::var(ENDPOINT_ENV).unwrap_or_else(|_| DEFAULT_ENDPOINT.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn endpoint_parsing_covers_the_shapes() {
        let e = parse_endpoint("http://localhost:1234/v1/chat/completions").unwrap();
        assert_eq!(e.host, "localhost");
        assert_eq!(e.port, 1234);
        assert_eq!(e.path, "/v1/chat/completions");

        let e = parse_endpoint("http://127.0.0.1:8080").unwrap();
        assert_eq!(e.path, "/");

        let e = parse_endpoint("http://myhost/api").unwrap();
        assert_eq!(e.port, 80);

        assert!(parse_endpoint("https://secure").is_err()); // TLS = dependency
        assert!(parse_endpoint("localhost:1234").is_err());
        assert!(parse_endpoint("http://:99/x").is_err());
    }

    #[test]
    fn content_extraction_handles_escapes() {
        let body = r#"{"choices":[{"message":{"role":"assistant","content":"Half ones, half zeros — entropy 1.0!\nPerfectly \"mixed\"."}}]}"#;
        let c = extract_content(body).unwrap();
        assert_eq!(
            c,
            "Half ones, half zeros — entropy 1.0!\nPerfectly \"mixed\"."
        );
    }

    #[test]
    fn content_extraction_prefers_message_block() {
        // A "content" appearing before "message" (e.g. in usage metadata)
        // must not be picked up.
        let body = r#"{"meta":{"content":"WRONG"},"choices":[{"message":{"content":"RIGHT"}}]}"#;
        assert_eq!(extract_content(body).unwrap(), "RIGHT");
    }

    #[test]
    fn surrogate_pairs_decode() {
        let body = r#"{"message":{"content":"bit 👾 party"}}"#;
        assert_eq!(extract_content(body).unwrap(), "bit 👾 party");
    }

    #[test]
    fn chunked_bodies_decode() {
        let headers = "HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked";
        let raw = b"5\r\nhello\r\n6\r\n world\r\n0\r\n\r\n";
        let out = decode_http_body(headers, raw).unwrap();
        assert_eq!(out, b"hello world");
    }

    #[test]
    fn resolve_endpoint_precedence() {
        assert_eq!(resolve_endpoint(Some("http://x:1/y")), "http://x:1/y");
        // (env-var case exercised in the integration test to avoid
        // mutating process env inside unit tests)
        assert_eq!(resolve_endpoint(None), {
            std::env::var(ENDPOINT_ENV).unwrap_or_else(|_| DEFAULT_ENDPOINT.to_string())
        });
    }

    #[test]
    fn default_endpoint_is_ollama_not_lm_studio() {
        // Pinned: the default targets Ollama's lightweight daemon (port
        // 11434), NOT LM Studio (port 1234, GUI app, RAM-hungry).
        // Changing this default is a deliberate decision: update the
        // operator-facing docs in the same commit.
        let e = parse_endpoint(DEFAULT_ENDPOINT).unwrap();
        assert_eq!(e.port, 11434, "default must point at Ollama");
        assert_eq!(e.host, "localhost");
        assert_eq!(e.path, "/v1/chat/completions");
    }
}
