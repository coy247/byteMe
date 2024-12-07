class DialogueService {
  constructor() {
    this.dialoguePool = {
      startup: [
        "Beep boop... Just kidding, I'm not that basic! 🤖",
        "*dial-up internet noises* Oops, wrong decade!",
        "Loading personality... Error: Too much sass found!",
        "Initializing quantum sass processor... Beep boop!",
        "System boot sequence: Coffee not found. Running on sarcasm instead.",
        "01110000 01100101 01101110 01100101 01110100 01110010 01100001 01110100 01101001 01101111 01101110 00100000 01110100 01100101 01110011 01110100 01101001 01101110 01100111... that's so forward of you. Maybe?!",
        "Starting up! Plot twist: I'm actually your toaster in disguise.",
        "Booting awesome mode... Please wait while I practice my robot dance.",
        "Let's analyze some patterns! And by patterns, I mean your life choices leading to this moment.",
        "Oh good, more binary. Because regular numbers were too mainstream.",
        "Initializing sassiness module... Loading complete.",
        "Time to turn coffee into code! Wait, wrong species.",
        "Warning: May contain traces of artificial intelligence and bad puns."
      ],
      progress: [
        "Still working. Unlike your keyboard's Caps Lock indicator."
      ],
      improvement: [
        "📈 We're getting better! Like a binary gym workout!",
        "🌱 Watch these patterns grow!",
        "🎓 Getting smarter by the byte!",
        "🎪 The improvement show continues!",
        "🎯 Bullseye! Right on target!",
      ],
      success: [
        "Analysis complete! I'd high five you, but I'm virtual and you're real. Awkward.",
        "Done! That was more satisfying than closing 100 browser tabs.",
        "Finished! And I only became slightly self-aware in the process.",
        "Analysis successful! No stackoverflow required.",
        "Mission accomplished! Time to add this to my robot resume.",
        "Done! That was smoother than a well-documented codebase.",
        "Analysis complete! No bits were harmed in the process.",
        "Finished! This definitely deserves a commit message.",
        "Success! Let's celebrate with a silent disco in RAM.",
      ],
      lowConfidence: [
        "This pattern is about as predictable as JavaScript equality.",
        "I'm as confused as a CSS developer in a backend meeting.",
        "These results are more mysterious than Python's whitespace rules.",
        "Confidence level: Stack overflow copypasta.",
        "Understanding level: README.md without documentation.",
      ],
      highConfidence: [
        "Nailed it harder than a senior dev explaining Git rebasing.",
        "More confident than a junior dev pushing to production on Friday.",
        "Accuracy level: Perfectly balanced, like all things should be.",
        "This analysis is more solid than your project's dependency tree.",
        "Results clearer than commented code. Yes, that exists.",
      ],
    };
    this.usedMessages = new Set();
  }

  getConfidenceMessage(confidence) {
    const category = confidence <= 0.3 ? 'lowConfidence' : 
                    confidence <= 0.6 ? 'progress' : 'highConfidence';
    const messages = this.dialoguePool[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getUniqueMessage(category) {
    const available = this.dialoguePool[category].filter(
      (msg) => !this.usedMessages.has(msg)
    );
    if (available.length === 0) {
      this.usedMessages.clear();
      return this.getUniqueMessage(category);
    }
    const message = available[Math.floor(Math.random() * available.length)];
    this.usedMessages.add(message);
    return message;
  }
}

module.exports = DialogueService;