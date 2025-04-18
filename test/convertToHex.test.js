// filepath: /Users/edgarzaro/projects/byteMe/test/convertToHex.test.js

/**
 * Converts RGB color values to hexadecimal color code
 * @param {Array<number>} rgb - Array containing [r, g, b] values (0-255)
 * @returns {string} - Hexadecimal color code with # prefix
 */
function convertToHex(rgb) {
  // Input validation
  if (!Array.isArray(rgb) || rgb.length !== 3) {
    if (rgb === null || rgb === undefined) {
       throw new Error("Expected an array with 3 RGB values, received: " + rgb);
    }
    if (!Array.isArray(rgb)) {
       throw new Error("Expected an array input, received type: " + typeof rgb);
    }
     throw new Error(`Expected an array with 3 RGB values, received ${rgb.length}`);
  }

  // Check if all elements are valid numbers
  if (!rgb.every((val) => typeof val === "number" && isFinite(val))) {
     const invalidValue = rgb.find(val => typeof val !== 'number' || !isFinite(val));
     const invalidIndex = rgb.findIndex(val => typeof val !== 'number' || !isFinite(val));
     throw new Error(`RGB values must be finite numbers. Found invalid value: ${invalidValue} at index ${invalidIndex}`);
  }

  // Extract, clamp, and floor RGB values
  const r = Math.max(0, Math.min(255, Math.floor(rgb[0])));
  const g = Math.max(0, Math.min(255, Math.floor(rgb[1])));
  const b = Math.max(0, Math.min(255, Math.floor(rgb[2])));

  // Convert to hex with padding
  const toHex = (val) => {
    const hex = Math.round(val).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


describe("convertToHex", () => {
  // Basic functionality tests
  test.each([
    [[255, 255, 255], "#ffffff", "white"],
    [[0, 0, 0], "#000000", "black"],
    [[255, 0, 0], "#ff0000", "red"],
    [[0, 255, 0], "#00ff00", "green"],
    [[0, 0, 255], "#0000ff", "blue"],
    [[255, 0, 255], "#ff00ff", "magenta"],
    [[255, 255, 0], "#ffff00", "yellow"],
  ])("converts RGB %j to %s (%s)", (input, expected, colorName) => {
    expect(convertToHex(input)).toBe(expected);
  });

  // Edge cases with single-digit values
  test("converts RGB [9, 10, 11] to #090a0b (pads single digits)", () => {
    expect(convertToHex([9, 10, 11])).toBe("#090a0b");
  });

  test("converts RGB [15, 15, 15] to #0f0f0f (pads single digits)", () => {
    expect(convertToHex([15, 15, 15])).toBe("#0f0f0f");
  });

  // Common UI colors
  test("converts RGB [51, 51, 51] to #333333", () => {
    expect(convertToHex([51, 51, 51])).toBe("#333333");
  });

  test("converts RGB [128, 128, 128] to #808080", () => {
    expect(convertToHex([128, 128, 128])).toBe("#808080");
  });

  // Error cases - Input validation
  test("handles non-array input by throwing error", () => {
    // Use expect(() => ...).toThrow()
    expect(() => convertToHex("not-an-array")).toThrow(/Expected an array input/);
  });

   test("handles array with incorrect length (2) by throwing error", () => {
    expect(() => convertToHex([255, 255])).toThrow(/Expected an array with 3 RGB values, received 2/);
  });

   test("handles array with incorrect length (0) by throwing error", () => {
     expect(() => convertToHex([])).toThrow(/Expected an array with 3 RGB values, received 0/);
   });

   test("handles array with too many values by throwing error", () => {
     expect(() => convertToHex([255, 255, 255, 255])).toThrow(/Expected an array with 3 RGB values, received 4/);
   });


  test("handles non-numeric RGB values by throwing error", () => {
    expect(() => convertToHex(["r", "g", "b"])).toThrow(/RGB values must be finite numbers. Found invalid value: r at index 0/);
  });

   test("handles mixed valid and non-numeric values by throwing error", () => {
     expect(() => convertToHex([255, "hello", 255])).toThrow(/RGB values must be finite numbers. Found invalid value: hello at index 1/);
   });

   test("handles string numbers by throwing error", () => {
     expect(() => convertToHex(["255", "0", "0"])).toThrow(/RGB values must be finite numbers. Found invalid value: 255 at index 0/);
   });

   test("handles NaN values by throwing error", () => {
     expect(() => convertToHex([NaN, 100, 150])).toThrow(/RGB values must be finite numbers. Found invalid value: NaN at index 0/);
   });

   test("handles Infinity values by throwing error", () => {
     expect(() => convertToHex([Infinity, 100, 150])).toThrow(/RGB values must be finite numbers. Found invalid value: Infinity at index 0/);
   });

   test("handles undefined inputs by throwing error", () => {
     expect(() => convertToHex(undefined)).toThrow(/Expected an array with 3 RGB values, received: undefined/);
   });

   test("handles null inputs by throwing error", () => {
     expect(() => convertToHex(null)).toThrow(/Expected an array with 3 RGB values, received: null/);
   });

   test("handles object input by throwing error", () => {
     expect(() => convertToHex({ r: 255, g: 255, b: 255 })).toThrow(/Expected an array input, received type: object/);
   });


  // Out-of-range values (should now clamp correctly)
  test("handles RGB values > 255 by clamping to 255", () => {
    expect(convertToHex([300, 1000, 255])).toBe("#ffffff");
  });

  test("handles negative RGB values by clamping to 0", () => {
    expect(convertToHex([-10, -200, 0])).toBe("#000000");
  });

   test("handles very large numbers by clamping to 255", () => {
     expect(convertToHex([100000, 2000000, 3000000])).toBe("#ffffff");
   });

   // Decimal value handling (should now truncate/floor correctly)
   test("converts RGB [123.5, 45.8, 67.2] to #7b2d43 (truncates decimals)", () => {
     expect(convertToHex([123.5, 45.8, 67.2])).toBe("#7b2d43");
   });

});

describe("convertToHex - Extended Test Suite", () => {
  // Additional basic color tests
  test("converts RGB [255, 0, 255] to #ff00ff (magenta)", () => {
    expect(convertToHex([255, 0, 255])).toBe("#ff00ff");
  });

  test("converts RGB [255, 255, 0] to #ffff00 (yellow)", () => {
    expect(convertToHex([255, 255, 0])).toBe("#ffff00");
  });

  test("converts RGB [0, 255, 255] to #00ffff (cyan)", () => {
    expect(convertToHex([0, 255, 255])).toBe("#00ffff");
  });

  // Web safe colors
  test("converts RGB [204, 204, 204] to #cccccc (web safe gray)", () => {
    expect(convertToHex([204, 204, 204])).toBe("#cccccc");
  });

  test("converts RGB [153, 51, 153] to #993399 (web safe purple)", () => {
    expect(convertToHex([153, 51, 153])).toBe("#993399");
  });

  // Boundary value tests
  test("converts RGB [254, 254, 254] to #fefefe (near white)", () => {
    expect(convertToHex([254, 254, 254])).toBe("#fefefe");
  });

  test("converts RGB [1, 1, 1] to #010101 (near black)", () => {
    expect(convertToHex([1, 1, 1])).toBe("#010101");
  });

  // Property-based tests
  test("function maintains RGB→HEX→RGB roundtrip integrity", () => {
    const hex = convertToHex([123, 45, 67]);
    expect(hex[0]).toBe("#");
    expect(hex.length).toBe(7);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/); // Use expect().toMatch() for regex
  });

  test("randomly generated valid RGB values produce valid hex codes", () => {
    // Run 100 random tests
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      
      const result = convertToHex([r, g, b]);
      
      // Check result format
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
      
      // Validate correct conversion (optional)
      const rHex = r.toString(16).padStart(2, '0');
      const gHex = g.toString(16).padStart(2, '0');
      const bHex = b.toString(16).padStart(2, '0');
      expect(result.toLowerCase()).toBe(`#${rHex}${gHex}${bHex}`);
    }
  });
});
