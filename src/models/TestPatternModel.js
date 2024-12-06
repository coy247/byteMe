class TestPatternModel {
  generateZigzagPattern(length = 32) {
    return Array.from({ length }, (_, i) => i % 2 === 0 ? '1' : '0').join('');
  }

  generateFibonacciQuantum(length = 32) {
    let fib = [1, 1];
    while (fib.length < length) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }
    return fib.map(n => n % 2).join('');
  }

  generatePrimeNeuralPattern(length = 32) {
    return Array.from({ length }, (_, i) => this.isPrime(i) ? '1' : '0').join('');
  }

  generateHyperPattern(length = 32) {
    return Array.from({ length }, (_, i) => 
      Math.sin(i * Math.PI / 8) > 0 ? '1' : '0'
    ).join('');
  }

  isPrime(num) {
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return num > 1;
  }
}