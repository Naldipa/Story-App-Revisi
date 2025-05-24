export default class HomePresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  async initialize() {
    if (!this.isLoading) {
      await this.loadStories();
    }
  }

  async loadStories() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      this.view.showLoading();
      const stories = await this.model.getAllStories({ page: 1, size: 10 });
      this.view.displayStories(stories);

      await this.initMainMap(stories);
    } catch (error) {
      if (error.message.toLowerCase().includes("authentication")) {
        window.location.hash = "#/login";
      } else {
        this.view.showError(error.message);
      }
    }
  }

  async initMainMap(stories) {
    try {
      const Map = (await import("../../utils/map")).default;
      this.mainMap = await Map.build("#main-map", { zoom: 5 });

      // Tambahkan marker untuk setiap story
      stories.forEach((story) => {
        if (story.lat && story.lon) {
          this.mainMap.addMarker([story.lat, story.lon], {
            popup: {
              content: `<b>${story.name}</b><br>${story.description}`,
              className: "story-popup",
            },
          });
        }
      });
    } catch (error) {
      console.error("Failed to initialize main map:", error);
    }
  }
}
