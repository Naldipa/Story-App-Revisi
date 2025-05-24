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
    await this.presenter.initialize();

    //Pasang handler untuk tombol Retry
    document.addEventListener("click", async (e) => {
      if (e.target && e.target.id === "retry-btn") {
        await this.presenter.loadStories();
      }
    });
  }
}
