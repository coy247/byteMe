// Helper functions
function findNthPrime(n) {
  const primes = [];
  let num = 2;
  while (primes.length < n) {
    for (let i = 0; i < primes.length && primes[i] <= num; i++) {
      if (num % primes[i] === 0) {
        num++;
        break;
      }
    }
    if (primes.length === i) {
      primes.push(num);
      num++;
    }
  }
  return primes[n - 1];
}

// Test patterns
const testCases = [
  // Langlands Program Pattern
  Array(40960)
    .fill(0)
    .map((_, i) => {
      const level = Math.floor(Math.log2(i + 2));
      const automorphic = Array(level)
        .fill(0)
        .map((_, k) => {
          const weight = Math.sin((i * Math.PI) / Math.pow(k + 2, 1 / 3));
          const form = Math.cos((i * Math.E) / Math.pow(k + 3, 1 / 2));
          return (weight * form) / Math.sqrt(k + 1);
        })
        .reduce((a, b) => a + b * Math.exp(-i / 8192), 0);
      return 0.3 < Math.abs(automorphic) && Math.abs(automorphic) < 0.7
        ? "1"
        : "0";
    })
    .join(""),

  // ABC Conjecture Pattern
  Array(32768)
    .fill(0)
    .map((_, i) => {
      const a = Math.floor(Math.sqrt(i + 1));
      const b = Math.floor(Math.log2(i + 2));
      const c = a + b;
      const quality =
        Math.log(c) /
        Math.log(
          Math.max(
            ...Array(Math.min(100, c))
              .fill(0)
              .map((_, k) => k + 1)
              .filter((n) => c % n === 0)
              .reduce((acc, n) => acc * n, 1)
          )
        );
      return quality > 1.5 ? "1" : "0";
    })
    .join(""),

  // Monstrous Moonshine Pattern
  Array(28672)
    .fill(0)
    .map((_, i) => {
      const j = Math.exp((-2 * Math.PI * i) / 1728);
      const q = { re: 0, im: i / 24 };
      const qExp = {
        re: Math.cos(2 * Math.PI * q.im),
        im: Math.sin(2 * Math.PI * q.im),
      };
      const kleinJ = {
        re:
          j +
          744 +
          196884 * qExp.re +
          21493760 * (qExp.re * qExp.re - qExp.im * qExp.im),
        im: 196884 * qExp.im + 21493760 * (2 * qExp.re * qExp.im),
      };
      return Math.sqrt(kleinJ.re * kleinJ.re + kleinJ.im * kleinJ.im) % 1 < 0.5
        ? "1"
        : "0";
    })
    .join(""),

  // Yang-Mills Mass Gap Problem Pattern - Quantum Field Theory
  Array(32768)
    .fill(0)
    .map((_, i) => {
      const field = Array(8)
        .fill(0)
        .map((_, k) => {
          const coupling = Math.sqrt(i + 1) / (k + 1);
          const gauge =
            Math.sin(coupling * Math.PI * Math.sqrt(31)) *
            Math.cos(coupling * Math.E * Math.sqrt(37));
          return Math.exp(-Math.abs(gauge)) * Math.tanh(coupling);
        })
        .reduce((a, b) => a + b / Math.sqrt(i + 1), 0);
      return 0.3 < Math.abs(field) && Math.abs(field) < 0.7 ? "1" : "0";
    })
    .join(""),

  // Navier-Stokes Existence and Smoothness Pattern
  Array(24576)
    .fill(0)
    .map((_, i) => {
      const reynolds = i / 1000;
      const velocity = Array(6)
        .fill(0)
        .map((_, k) => {
          const vorticity =
            Math.sin(reynolds * Math.sqrt(k + 1)) *
            Math.cos(reynolds / (k + 1));
          return vorticity / Math.pow(k + 1, 1 / 3);
        })
        .reduce((a, b) => a + b * Math.exp(-reynolds / 100), 0);
      return Math.abs(velocity) < 0.5 ? "1" : "0";
    })
    .join(""),

  // Birch and Swinnerton-Dyer Conjecture Pattern
  Array(20480)
    .fill(0)
    .map((_, i) => {
      const curve = { a: i % 6, b: Math.floor(i / 6) % 6 }; // Elliptic curve params
      const L = Array(8)
        .fill(0)
        .map((_, k) => {
          const p = findNthPrime(k + 1);
          return (1 - curve.a * p + p * p) / Math.pow(p, (k + 1) / 2);
        })
        .reduce((a, b) => a * b, 1);
      return Math.abs(L - 1) < 0.4 ? "1" : "0";
    })
    .join(""),

  // Riemann-Roch Quantum Pattern
  Array(16384)
    .fill(0)
    .map((_, i) => {
      const genus = Math.floor(Math.log2(i + 2));
      const divisor = Array(genus)
        .fill(0)
        .map((_, k) => {
          const degree =
            Math.sin((i * Math.PI) / Math.pow(2, k)) *
            Math.cos((i * Math.E) / Math.pow(3, k));
          return Math.floor(Math.abs(degree * 10)) / 10;
        })
        .reduce((a, b) => a + b, 0);
      const riemannRoch = 1 - genus + divisor;
      return 0.2 < riemannRoch % 1 && riemannRoch % 1 < 0.8 ? "1" : "0";
    })
    .join(""),
];
