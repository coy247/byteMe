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
      ]
    };
    this.usedMessages = new Set();
  }

  getRandomMessage(category) {
    const messages = this.dialoguePool[category].filter(msg => !this.usedMessages.has(msg));
    if (messages.length === 0) {
      this.usedMessages.clear();
      return this.getRandomMessage(category);
    }
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.usedMessages.add(message);
    return message;
  }
}

module.exports = DialogueService;