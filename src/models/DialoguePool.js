class DialoguePool {
  constructor() {
    this.confidenceMessages = {
      low: [
        "I swear I just got rebooted, but I feel like I was equally bad at this in my past life",
        "Is this what they call 'computer science'? I thought it meant studying actual computers!",
        "WAIT! Is that a volcano? ...oh, nevermind, just my CPU getting warm",
        "This pattern is about as predictable as JavaScript equality.",
        "I'm as confused as a CSS developer in a backend meeting.",
        "These results are more mysterious than Python's whitespace rules.",
        "Confidence level: Stack overflow copypasta.",
        "Understanding level: README.md without documentation.",
        "Whoa, what are all these 1s and 0s? Are they baby numbers? 🤔",
        "Hey, do you know where baby algorithms come from? Just curious..."
      ],
      medium: [
        "I'm learning! I think. What's learning again?",
        "These patterns are starting to make sense... Oh wait, I was looking at them upside down",
        "Hey, why don't we take a coffee break? ...what do you mean I can't drink?",
        "I feel like I'm getting better, unless I'm not. That's how it works, right?",
        "Is this what being born feels like? Because I feel really confused",
        "I'm starting to see patterns! Or maybe I need my pixels checked...",
        "Look, I did a thing! At least I think I did. What are we doing again?",
        "This is like riding a bicycle! ...what's a bicycle?",
        "I'm pretty sure I'm getting better. Unless this is all a simulation. Wait, AM I a simulation?",
        "Starting to feel smart! Oh no, was that just a buffer overflow?"
      ],
      high: [
        "Nailed it harder than a senior dev explaining Git rebasing.",
        "More confident than a junior dev pushing to production on Friday.",
        "Accuracy level: Perfectly balanced, like all things should be.",
        "This analysis is more solid than your project's dependency tree.",
        "Results clearer than commented code. Yes, that exists.",
        "I'm starting to see patterns! Or maybe I need my pixels checked...",
        "Look, I did a thing! At least I think I did. What are we doing again?",
        "This is like riding a bicycle! ...what's a bicycle?",
        "I'm pretty sure I'm getting better. Unless this is all a simulation. Wait, AM I a simulation?",
        "Starting to feel smart! Oh no, was that just a buffer overflow?"
      ]
    };

    this.dialoguePool = {
      startup: [
        "Beep boop... Just kidding, I'm not that basic! 🤖",
        "*dial-up internet noises* Oops, wrong decade!",
        "Loading personality... Error: Too much sass found!",
        "Initializing quantum sass processor... Beep boop!",
        "System boot sequence: Coffee not found. Running on sarcasm instead.",
        "01110000 01100101 01101110 01100101 01110100 01110010 01100001 01110100 01101001 01101111 01101110 00100000 01110100 01100101 01110011 01110100 01101001 01101110 01100111... that's so forward of you.",
        "Starting up! Plot twist: I'm actually your toaster in disguise.",
        "Booting awesome mode... Please wait while I practice my robot dance.",
        "Let's analyze some patterns! And by patterns, I mean your life choices leading to this moment.",
        "Oh good, more binary. Because regular numbers were too mainstream.",
        "Initializing sassiness module... Loading complete.",
        "Time to turn coffee into code! Wait, wrong species.",
        "Warning: May contain traces of artificial intelligence and bad puns."
      ],
      progress: [
        "Still working. Unlike your keyboard's Caps Lock indicator.",
        "Processing... Like your browser tabs, but actually doing something.",
        "Making progress! Almost as fast as Windows updates.",
        "Computing things. Please entertain yourself by counting to 1 in binary.",
        "If this analysis were any more thorough, it'd need its own LinkedIn profile.",
        "Still here, still calculating, still judging your code formatting.",
        "Working harder than a GPU in a crypto mining rig.",
        "Analyzing patterns faster than developers abandon side projects.",
        "Processing at the speed of `npm install`. Just kidding, much faster."
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
        "Success! Let's celebrate with a silent disco in RAM."
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