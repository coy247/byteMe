//! Input-to-binary encoding.
//!
//! If the input is already a binary string (with optional whitespace),
//! return it stripped. Otherwise UTF-8 encode each byte to 8 bits.

pub fn to_binary(input: &str) -> String {
    let stripped: String = input.chars().filter(|c| !c.is_whitespace()).collect();
    if !stripped.is_empty() && stripped.chars().all(|c| c == '0' || c == '1') {
        return stripped;
    }
    let mut out = String::with_capacity(input.len() * 8);
    for byte in input.bytes() {
        out.push_str(&format!("{:08b}", byte));
    }
    out
}

/// Reverse a binary string back to UTF-8 text, if it can be interpreted
/// as a byte stream. Returns `None` if the binary length isn't a multiple
/// of 8 or the resulting bytes are not valid UTF-8.
pub fn from_binary(binary: &str) -> Option<String> {
    if binary.len() % 8 != 0 || binary.is_empty() {
        return None;
    }
    let mut bytes = Vec::with_capacity(binary.len() / 8);
    for chunk in binary.as_bytes().chunks(8) {
        let s = std::str::from_utf8(chunk).ok()?;
        let b = u8::from_str_radix(s, 2).ok()?;
        bytes.push(b);
    }
    String::from_utf8(bytes).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn binary_input_passes_through() {
        assert_eq!(to_binary("01001000"), "01001000");
        assert_eq!(to_binary("0100 1000"), "01001000");
    }

    #[test]
    fn text_input_gets_encoded() {
        assert_eq!(to_binary("Hi"), "0100100001101001");
    }

    #[test]
    fn roundtrip_for_text() {
        let encoded = to_binary("Hi!");
        assert_eq!(from_binary(&encoded), Some("Hi!".to_string()));
    }

    #[test]
    fn from_binary_rejects_misaligned_input() {
        assert_eq!(from_binary("0100100"), None);
    }
}
