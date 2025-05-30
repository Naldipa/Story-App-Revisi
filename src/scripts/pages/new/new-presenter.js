export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showNewFormMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photo, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description: description,
        lat: latitude,
        lon: longitude,
        photo,
      };
      const response = await this.#model.storeNewStory(data);

      if (!response.ok) {
        console.error("postNewStory: response:", response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully(response.message, response.data);
    } catch (error) {
      console.error("postNewReport: error:", error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
