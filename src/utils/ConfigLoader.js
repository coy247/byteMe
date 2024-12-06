class ConfigLoader {
  static async load() {
    const config = new Config();
    await config.load();
    return config;
  }
}

module.exports = ConfigLoader;