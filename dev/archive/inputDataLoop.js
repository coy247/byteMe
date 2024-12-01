forEach(binary => console.log(
  `\nTesting binary: ${binary.slice(0, 50)}...`,
  analyzeBinary(binary)
));

function calculateEntropy(str) {
  const freq = [...str].reduce((f, c) => ({...f, [c]: (f[c] || 0) + 1}), {});
  return Object.values(freq).reduce((e, c) => e - (c/str.length) * Math.log2(c/str.length), 0);
}
