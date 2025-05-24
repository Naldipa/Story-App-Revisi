import HomeView from "./home-view.js";
import HomePresenter from "./home-presenter.js";
import StoryModel from "../../models/story-model.js";

export default class HomePage {
  constructor() {
    this.view = new HomeView();
    this.model = new StoryModel();
    this.presenter = new HomePresenter({
      view: this.view,
      model: this.model,
    });
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    this.view.setRetryHandler(() => this.presenter.loadStories());
    await this.presenter.initialize();
  }
}
