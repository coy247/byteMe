class AnalysisView {
  constructor() {
    this.template = require("../templates/analysis.js");
  }
  render(data) {
    return this.template(data);
  }
  update(results) {
    const html = this.render(results);
    document.getElementById("analysis").innerHTML = html;
  }
}
module.exports = AnalysisView;
