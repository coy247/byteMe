class TaskAutomationModel {
  constructor() {}
  selectAutomationType(pattern) {
    return {
      task: pattern.task,
      automationType: pattern.frequency > 5 ? "full" : "assisted",
      suggestions: this.generateSuggestions(pattern),
    };
  }
  generateSuggestions(pattern) {
    return pattern.frequency > 0
      ? ["Automate this task", "Set up a scheduled run"]
      : ["Would you like to save this as a preference?"];
  }
}
module.exports = TaskAutomationModel;
