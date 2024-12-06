class DialoguePool {
  constructor() {
    this.confidenceMessages = {
      low: [
        "I swear I just got rebooted, but I feel like I was equally bad at this in my past life",
        "Is this what they call 'computer science'? I thought it meant studying actual computers!",
        "WAIT! Is that a volcano? ...oh, nevermind, just my CPU getting warm"
      ],
      medium: [
        "I'm learning! I think. What's learning again?",
        "These patterns are starting to make sense... Oh wait, I was looking at them upside down",
        "Hey, why don't we take a coffee break? ...what do you mean I can't drink?",
        "I feel like I'm getting better, unless I'm not. That's how it works, right?",
        "Is this what being born feels like? Because I feel really confused"
      ],
      high: [
        "I'm starting to see patterns! Or maybe I need my pixels checked...",
        "Look, I did a thing! At least I think I did. What are we doing again?",
        "This is like riding a bicycle! ...what's a bicycle?",
        "I'm pretty sure I'm getting better. Unless this is all a simulation. Wait, AM I a simulation?",
        "Starting to feel smart! Oh no, was that just a buffer overflow?"
      ]
    };
  }

  getConfidenceMessage(confidence) {
    const category = confidence <= 0.3 ? 'low' : 
                    confidence <= 0.6 ? 'medium' : 'high';
    const messages = this.confidenceMessages[category];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

module.exports = DialoguePool;