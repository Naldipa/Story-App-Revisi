import { storyMapper } from "../../data/api-mapper";

export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async initialGallery() {
    this.#view.showLoading();

    try {
      const response = await this.#model.getAllStories();
      const story = await Promise.all(
        response.map(async (story) => {
          if (story.lat && story.lon) {
            return await storyMapper(story);
          }
          return story;
        })
      );

      this.#view.populateBookmarkedStories(story);
    } catch (error) {
      console.error("initialGallery: error:", error);
      this.#view.populateBookmarkedStoriesError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
