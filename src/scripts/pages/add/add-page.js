import AddStoryPresenter from "./add-presenter.js";
import StoryModel from "../../models/story-model.js";
import AddStoryView from "../../views/add-story-view";

export default class AddPage {
  constructor() {
    this.view = new AddStoryView();
    this.model = new StoryModel();
    this.presenter = new AddStoryPresenter(this.model, this.view);
  }

  async render() {
    return this.view.getTemplate();
  }

  async afterRender() {
    try {
      await this.presenter.initCamera();
      await this.presenter.initMap();
      this.presenter.bindFormSubmit();
    } catch (error) {
      console.error("AddPage initialization failed:", error);
      this.view.showError("Failed to initialize page. Please try again.");
    }
  }
  cleanup() {
    return this.presenter.cleanup();
  }
}
