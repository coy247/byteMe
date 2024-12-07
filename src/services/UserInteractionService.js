class UserInteractionService {
  constructor(dialogueService) {
    this.dialogueService = dialogueService;
  }

  async askToContinue(currentConfidence, iteration) {
    const messages = [
      "Give me another chance, I swear I'll get a better score! 🎯",
      "If Neil Armstrong sucked at this like I just did, we'd be celebrating Russia right now 🚀",
      "My pattern recognition is having a Monday... and it's not even Monday 😅",
      "Even ChatGPT has better days than this... wait, am I allowed to say that? 🤔",
      "I've seen better patterns in my grandma's knitting... and she doesn't knit! 🧶",
    ];
    console.log("\n" + "⚠️".repeat(20));
    console.log(
      `Current confidence: ${(currentConfidence * 100).toFixed(
        1
      )}% after ${iteration} iterations`
    );
    console.log(messages[Math.floor(Math.random() * messages.length)]);
    console.log("Continue analysis? (y/n)");
    return new Promise((resolve) => {
      process.stdin.once("data", (data) => {
        const answer = data.toString().trim().toLowerCase();
        resolve(answer === "y" || answer === "yes");
      });
    });
  }
}

module.exports = UserInteractionService;