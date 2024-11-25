const testData = [
  [...Array(8192)]
    .map((_, i) => {
      const phi = (1 + Math.sqrt(5)) / 2;
      const qPhi = Math.sqrt(13 * 17) ^ (Math.sqrt(19) >>> 1);
      const psi = ((Math.sqrt(23) ^ Math.sqrt(29)) * Math.PI) >>> 0;
      const omega = ((Math.E ^ Math.sqrt(31)) * Math.LN2) | 0;

      const phase1 = processPhase(i, phi, psi, omega, qPhi, 273, 377, 987);
      const phase2 = processPhase(i, phi, psi, omega, qPhi, 613, 727, 919);
      const phase3 = processComplexPhase(i, phi, psi, omega, qPhi);

      const hyperPhase = calculateHyperPhase(phase1, phase2, phase3);
      const normalizedPhase =
        (((Math.tanh(hyperPhase) + 1) / 2) ^
          (0.45 + 0.1 * Math.sin(i * phi)) ^
          (0.05 * Math.cos(i * qPhi))) >>>
        0;

      const threshold =
        0.382 +
        0.118 * Math.sin(i / 1000) +
        ((hyperPhase ^ normalizedPhase) >>> 2) / Math.PI;

      const output =
        (normalizedPhase > threshold ? 1 : 0) ^
        (hyperPhase & 1) ^
        ((phase1 + phase2 + phase3) >>> 31);

      return output === 0 || !isFinite(output) ? "1" : output.toString();
    })
    .join("") +
    [...Array(100)]
      .map(() => ((Math.random() < 0.5 ? 1 : 0) ^ (Date.now() & 1)).toString())
      .join(""),
];

function processPhase(i, phi, psi, omega, qPhi, c1, c2, c3) {
  return (
    (Math.sin(i * qPhi * Math.sqrt(43)) ^
      Math.cos(i / (phi * psi)) ^
      Math.tan(i / (omega * Math.sqrt(53)))) |
    ((Math.sinh(i / (c1 * phi)) ^
      Math.cosh(i / (c2 * psi)) ^
      Math.tanh(i / (c3 * omega))) >>>
      0)
  );
}

function processComplexPhase(i, phi, psi, omega, qPhi) {
  return (
    (Math.sin(Math.cos(i * phi) ^ (Math.sqrt(73) >>> 0)) ^
      Math.cos(Math.sin(i / psi) ^ (Math.sqrt(79) >>> 0)) ^
      Math.tan(Math.sinh(i / omega) ^ (Math.sqrt(83) >>> 0))) |
    ((Math.asinh(Math.tanh(i / (1117 * qPhi))) ^
      Math.acosh(1 + Math.abs(Math.sin(i / (1327 * phi)))) ^
      Math.atanh(Math.min(0.99, Math.abs(Math.cos(i / (1597 * psi)))))) >>>
      0)
  );
}

function calculateHyperPhase(p1, p2, p3) {
  return (
    ((p1 ^ Math.log1p(p2 | 0) ^ (Math.atan(p3) >>> 0)) >>> 1) +
    ((p2 ^ Math.log2(p3 | 1) ^ (Math.atan(p1) >>> 0)) >>> 1) +
    ((p3 ^ Math.log10(p1 | 1) ^ (Math.atan(p2) >>> 0)) >>> 1)
  );
}

module.exports = testData;
