// Imports and constants
const { stdout } = process;
const { log, error: consoleError } = console;

// Configuration
const CONFIG = {
  animationSpeed: 800,
  colorEnabled: true,
  transitionDelay: 100,
  loadingBarWidth: 40
};

// Demo Configuration
const DEMO_CONFIG = {
  ...CONFIG,
  demoMode: true,
  matrixEffect: true,
  simulateErrors: false,
  bootMessages: [
    "BIOS Version 2.0.1337",
    "Memory Test: OK",
    "CPU: Quantum Core i9",
    "GPU: HoloTech 4090Ti",
    "Neural Network: Online",
    "AI Subsystems: Active"
  ]
};

// Enhanced display utilities
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

function createLoadingBar(progress, width = CONFIG.loadingBarWidth) {
  const filled = Math.floor(progress * width);
  const empty = width - filled;
  return `[${colors.green}${"█".repeat(filled)}${colors.dim}${"-".repeat(empty)}${colors.reset}]`;
}

async function animateText(text, delay = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  process.stdout.write("\n");
}

// Enhanced display utilities
function displayBanner() {
  log(`
       ███████╗ ██╗   ██╗ ████████╗ ███████╗ ███╗   ███╗ ███████╗ ██╗
       ██╔══██║ ╚██╗ ██╔╝    ██╔══╝ ██╔════╝ ████╗ ████║ ██╔════╝ ██║
       ███████║  ╚████╔╝     ██║    █████╗   ██╔████╔██║ █████╗   ██║
       ██╔══██║   ╚██╔╝      ██║    ██╔══╝   ██║╚██╔╝██║ ██╔══╝   ╚═╝
       ███████║    ██║       ██║    ███████╗ ██║ ╚═╝ ██║ ███████╗ ██╗
       ╚══════╝    ╚═╝       ╚═╝    ╚══════╝ ╚═╝     ╚═╝ ╚══════╝ ╚═╝

       ╔════════════════════════════════════════════════════════╗
       ║         ByteMe Analysis System v0.1.0                  ║
       ╚════════════════════════════════════════════════════════╝
    `);
}

function getRandomColor() {
  const colors = ["red", "green", "blue", "magenta", "cyan", "yellow"];
  return `\x1b[${31 + Math.floor(Math.random() * 6)}m`;
}

function clearScreen() {
  stdout.write("\x1Bc");
}

// Matrix effect animation
async function playMatrixEffect(duration = 2000) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
  const columns = process.stdout.columns;
  const streams = Array(columns).fill(0);
  
  const interval = setInterval(() => {
    let output = "";
    for (let i = 0; i < columns; i++) {
      if (Math.random() < 0.1) {
        streams[i] = 1;
      }
      if (streams[i]) {
        output += colors.green + chars[Math.floor(Math.random() * chars.length)] + colors.reset;
        streams[i] += Math.random() < 0.1 ? 1 : 0;
      } else {
        output += " ";
      }
    }
    process.stdout.write(`\r${output}`);
  }, 50);

  await new Promise(resolve => setTimeout(resolve, duration));
  clearInterval(interval);
  clearScreen();
}

// Enhanced boot sequence
async function playEnhancedBootSequence() {
  const stages = [
    { text: "Initializing system components", duration: 1000 },
    { text: "Loading core modules", duration: 1500 },
    { text: "Calibrating quantum processors", duration: 1200 },
    { text: "Establishing neural networks", duration: 800 }
  ];

  for (const [index, stage] of stages.entries()) {
    const progress = (index + 1) / stages.length;
    await animateText(`${colors.cyan}${stage.text}...${colors.reset}`);
    process.stdout.write(`\r${createLoadingBar(progress)} ${Math.floor(progress * 100)}%`);
    await new Promise(resolve => setTimeout(resolve, stage.duration));
    process.stdout.write("\n");
  }
}

// Enhanced demo boot sequence
async function playDemoBootSequence() {
  // Matrix effect intro
  await playMatrixEffect();
  
  // BIOS-style boot messages
  for (const message of DEMO_CONFIG.bootMessages) {
    await animateText(`${colors.cyan}[BOOT] ${message}${colors.reset}`, 30);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // System check progress bars
  const systems = [
    "Quantum Core", "Neural Engine", "Pattern Matrix",
    "Entropy Scanner", "Reality Engine", "Time Dilation"
  ];

  for (const [index, system] of systems.entries()) {
    const progress = (index + 1) / systems.length;
    process.stdout.write(`\r${colors.yellow}Initializing ${system}... ${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    process.stdout.write(createLoadingBar(progress));
    await new Promise(resolve => setTimeout(resolve, 300));
    process.stdout.write(`\r${colors.green}✓ ${system} Online${colors.reset}\n`);
  }
}

// Enhanced startup manager
const EnhancedStartupManager = {
  isRunning: false,
  cleanupHandlers: new Set(),

  registerCleanup(handler) {
    this.cleanupHandlers.add(handler);
  },

  async cleanup() {
    for (const handler of this.cleanupHandlers) {
      await handler();
    }
  },

  async runStartupSequence() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      clearScreen();
      await displayBanner();
      await animateText(`${colors.yellow}Welcome to ByteMe Analysis System${colors.reset}`, 50);
      await playEnhancedBootSequence();
      await this.transitionToMainApp();
    } catch (err) {
      consoleError(`${colors.red}Startup Error:${colors.reset}`, err);
      await this.cleanup();
      process.exit(1);
    } finally {
      this.isRunning = false;
    }
  },

  async transitionToMainApp() {
    await animateText(`${colors.green}System Ready${colors.reset}`, 30);
    await new Promise(resolve => setTimeout(resolve, 500));
    clearScreen();
  },

  async runDemoSequence() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      clearScreen();
      await displayBanner();
      await playDemoBootSequence();
      await animateText(`${colors.green}Demo System Ready${colors.reset}`, 30);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.transitionToMainApp();
    } catch (err) {
      consoleError(`${colors.red}Demo Error:${colors.reset}`, err);
      await this.cleanup();
    } finally {
      this.isRunning = false;
    }
  }
};

// Graceful shutdown handler
process.on("SIGINT", async () => {
  console.log("\n\nGracefully shutting down...");
  await EnhancedStartupManager.cleanup();
  process.exit(0);
});

// Export enhanced interface
module.exports = {
  EnhancedStartupManager,
  CONFIG,
  colors,
  DEMO_CONFIG,
  playMatrixEffect
};

// Auto-start if main module
if (require.main === module) {
  (async () => {
    try {
      await EnhancedStartupManager.runDemoSequence();
    } catch (error) {
      consoleError(colors.red + "Fatal Error:", error + colors.reset);
      process.exit(1);
    }
  })();
}
