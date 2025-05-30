import { parseActivePathname } from "../../routes/url-parser";
import StoryDetailPresenter from "./story-detail-presenter";
import {
  generateLoaderAbsoluteTemplate,
  generateRemoveStoryButtonTemplate,
  generateSaveStoryButtonTemplate,
  generateStoriesListErrorTemplate,
  generateStoryDetailTemplate,
} from "../../templates";
import Map from "../../utils/map";
import * as StoryAPI from "../../data/api";
import Database from "../../data/database";

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
       <section>
         <div class="story-detail__container">
           <div id="story-detail" class="story-detail"></div>
           <div id="story-detail-loading-container"></div>
           <div id="save-actions-container"></div> <!-- Ensure this is included -->
         </div>
       </section>
     `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: StoryAPI,
      dbModel: Database,
    });

    this.#presenter.showStoryDetail();
  }

  async populateStoryDetail(story) {
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailTemplate(story);
    if (story.placeName) {
      document.querySelector(
        ".story-detail__body__map__container"
      ).style.display = "block";
      await this.#presenter.showStoryDetailMap();

      if (this.#map) {
        const storyCoordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.placeName };
        const popupOptions = { content: story.description };

        this.#map.changeCamera(storyCoordinate);
        this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
      }
    }

    await this.#presenter.showSaveButton();
  }

  populateStoryDetailError(error) {
    document.getElementById("story-detail").innerHTML =
      generateStoriesListErrorTemplate(error);
  }

  showStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML = "";
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  renderSaveButton() {
    document.getElementById("save-actions-container").innerHTML =
      generateSaveStoryButtonTemplate();

    document.addEventListener("click", (event) => {
      if (event.target.matches("#story-detail-save")) {
        this.#presenter
          .saveStory()
          .then(() => this.#presenter.showSaveButton());
      }
    });
  }

  renderRemoveButton() {
    const saveActionsContainer = document.getElementById(
      "save-actions-container"
    );

    if (saveActionsContainer) {
      saveActionsContainer.innerHTML = generateRemoveStoryButtonTemplate();

      const removeButton = document.getElementById("story-detail-remove");
      if (removeButton) {
        removeButton.addEventListener("click", async () => {
          await this.#presenter.removeStory();
          await this.#presenter.showSaveButton();
        });
      } else {
        console.error("Remove button not found in the DOM.");
      }
    } else {
      console.error("Save actions container not found in the DOM.");
    }
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }
  removeFromBookmarkFailed(message) {
    alert(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 15,
    });
  }
}
