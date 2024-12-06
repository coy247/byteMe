const ModelFactory = require("../factories/ModelFactory");
const ViewFactory = require("../factories/ViewFactory");
const ControllerFactory = require("../factories/ControllerFactory");
class InitializationService {
  constructor(config) {
    this.config = config;
    this.modelFactory = new ModelFactory(config);
    this.viewFactory = new ViewFactory(config);
    this.controllerFactory = new ControllerFactory(config);
  }
  async initialize() {
    const models = await this.initializeModels();
    const views = await this.initializeViews();
    const controllers = await this.initializeControllers(models, views);
    return { models, views, controllers };
  }
}
module.exports = InitializationService;
