const testExecutionService = require('../services/TestExecutionService');
const hyperPattern = require('../patterns/hyperPattern');
const primeNeuralPattern = require('../patterns/primeNeuralPattern');
const fibonacciQuantumPattern = require('../patterns/fibonacciQuantum');

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function zigzagPattern(i, phi = (1 + Math.sqrt(5)) / 2) {
  const zigzag = Math.sin(i * phi * Math.sqrt(53)) *
    Math.cos(i * Math.E * Math.sqrt(59)) *
    Math.tan(i / (13 * Math.SQRT2)) *
    Math.sinh(i / (377 * phi)) *
    Math.pow(Math.abs(Math.sin(i * Math.sqrt(61))), 3) *
    Math.log2(i + phi) *
    Math.exp(-i / 6144) *
    Math.atan(Math.sqrt(i)) *
    Math.tanh(Math.cbrt(i)) *
    Math.pow(Math.cos(i / 800), 2);
  return (zigzag + Math.sin(i / 100)) % 2 > 0.7 ? "1" : "0";
}

const fibonacciPattern = Array(10240)
  .fill(0)
  .map((_, i) => {
    const fib = fibonacci(i % 100);
    const quantum =
      Math.sin(i * fib * Math.sqrt(67)) *
      Math.cos(i * Math.E * Math.sqrt(71)) *
      Math.tan(i / (17 * Math.SQRT2)) *
      Math.sinh(i / ((433 * (1 + Math.sqrt(5))) / 2)) *
      Math.pow(Math.abs(Math.sin(i * Math.sqrt(73))), 4) *
      Math.log2(i + Math.E) *
      Math.exp(-i / 5120) *
      Math.asinh(Math.cos(i / 400)) *
      Math.cosh(Math.sin(i / 900));
    return (quantum * fib + 4) % 5 > 2.2 ? "1" : "0";
  })
  .join("") + "11010".repeat(100);

const primeNeuralPattern = Array(12288)
  .fill(0)
  .map((_, i) => {
    const primeWeight = isPrime(i)
      ? Math.sin(i * Math.sqrt(79))
      : Math.cos(i * Math.sqrt(83));
    const neural =
      Math.sin(i * Math.PI * Math.sqrt(89)) *
      Math.cos(i * Math.E * Math.sqrt(97)) *
      Math.tan(i / (19 * Math.SQRT2)) *
      Math.sinh(i / (577 * Math.E)) *
      Math.pow(Math.abs(Math.sin(i * Math.sqrt(101))), 5) *
      Math.log2(i + Math.PI) *
      Math.exp(-i / 7168) *
      Math.acosh(Math.abs(Math.sin(i / 500))) *
      Math.tanh(Math.cos(i / 1100));
    return (neural * primeWeight + 5) % 6 > 2.5 ? "1" : "0";
  })
  .join("") + "10101".repeat(100);

const hyperPatternResult = Array(11264)
  .fill(0)
  .map((_, i) => {
    const modular = (i * 19937 + 104729) % 3571;
    const hyper =
      Math.sin(i * Math.PI * Math.sqrt(103)) *
      Math.cos(i * Math.E * Math.sqrt(107)) *
      Math.tan(i / (23 * Math.SQRT2)) *
      Math.sinh(i / (613 * Math.PI)) *
      Math.pow(Math.abs(Math.sin(i * Math.sqrt(109))), 6) *
      Math.log2(i + Math.LN2) *
      Math.exp(-i / 6656) *
      Math.atanh(Math.min(0.99, Math.abs(Math.sin(i / 600)))) *
      Math.cosh(Math.cos(i / 1300));
    return (modular * hyper + 6) % 7 > 3.1 ? "1" : "0";
  })
  .join("") + "11001".repeat(100);

const testCases = [
  zigzagPattern,
  fibonacciPattern,
  primeNeuralPattern,
  hyperPatternResult
];

module.exports = testCases;
