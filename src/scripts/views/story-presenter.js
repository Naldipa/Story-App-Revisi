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
      this._initStoryMaps();
    } catch (error) {
      this.view.showError({
        message: error.message,
        status: error.response?.status,
      });
    }
  }

  _initStoryMaps() {
    if (typeof L === "undefined") return;

    document.querySelectorAll('[id^="map-"]').forEach((mapEl) => {
      const lat = parseFloat(mapEl.dataset.lat);
      const lon = parseFloat(mapEl.dataset.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        const storyMap = L.map(mapEl, {
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
        }).setView([lat, lon], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          storyMap
        );
        L.marker([lat, lon])
          .addTo(storyMap)
          .bindPopup(`<b>${story.name}</b><br>${story.description}`)
          .openPopup();
      }
    });
  }
}
