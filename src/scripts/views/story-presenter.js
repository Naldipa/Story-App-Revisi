export default class StoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  async loadStories() {
    this.view.showLoading();

    try {
      const { list: stories } = await this.model.getAllStories({
        page: 1,
        size: 10,
        location: 1,
      });

      this.view.displayStories(stories);
      this.view.initializeStoryMaps(); // DOM & Map pindah ke view
    } catch (error) {
      this.view.showError({
        message: error.message,
        status: error.response?.status,
      });
    }
  }
}
