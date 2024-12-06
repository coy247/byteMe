class MathUtils {
  static std(arr) {
    const mean = arr.reduce((a, b) => a + b) / arr.length;
    return Math.sqrt(
      arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
    );
  }

  static fibonacci(n) {
    let a = 1,
      b = 0,
      temp;
    while (n >= 0) {
      temp = a;
      a = a + b;
      b = temp;
      n--;
    }
    return b;
  }

  static isPrime(num) {
    for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
    return num > 1;
  }

  static calculateEntropy(arr) {
    const freq = {};
    arr.forEach((item) => (freq[item] = (freq[item] || 0) + 1));
    return -Object.values(freq).reduce((sum, count) => {
      const p = count / arr.length;
      return sum + p * Math.log2(p);
    }, 0);
  }

  static calculateCorrelation(arr) {
    const mean = arr.reduce((a, b) => a + b) / arr.length;
    const variance = this.std(arr) ** 2;
    return (
      arr
        .slice(1)
        .reduce((acc, val, i) => acc + (val - mean) * (arr[i] - mean), 0) /
      ((arr.length - 1) * variance)
    );
  }

  static normalizeArray(arr) {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    return arr.map((val) => (val - min) / (max - min));
  }

  static movingAverage(arr, windowSize) {
    const result = [];
    for (let i = 0; i <= arr.length - windowSize; i++) {
      const sum = arr.slice(i, i + windowSize).reduce((a, b) => a + b);
      result.push(sum / windowSize);
    }
    return result;
  }
}

module.exports = MathUtils;
