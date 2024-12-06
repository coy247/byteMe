class ModelData {
  constructor(data) {
    this.id = data.id;
    this.timestamp = Date.now();
    this.summary = data.summary;
    this.data = data;
  }
  validate() {
    return Boolean(this.id && this.summary);
  }
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      summary: this.summary,
      data: this.data,
    };
  }
}
module.exports = ModelData;
