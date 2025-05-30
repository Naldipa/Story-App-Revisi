import Camera from "../../utils/camera";
import NewPresenter from "./new-presenter";
import * as StoryAPI from "../../data/api";
import Map from "../../utils/map";
import { generateLoaderAbsoluteTemplate } from "../../templates";

export default class NewPage {
  #presenter;
  #form;
  #isCameraOpen = false;
  #takenDocumentations = null;
  #camera;
  #map = null;

  async render() {
    return `  
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <h1 class="new-report__header__title">Buat Story Baru</h1>
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Deskripsi</label>

              <div class="new-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Masukkan deskripsi"
                ></textarea>
              </div>
            </div>
            <div class="form-control">
              <label for="documentations-input" class="new-form__documentations__title">Media</label>

              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <button id="documentations-input-button" class="btn btn-ghost" type="button">Ambil Gambar</button>
                  <input
                    id="documentations-input"
                    class="new-form__documentations__input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    multiple
                    aria-multiline="true"
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-documentations-camera-button" class="btn btn-ghost" type="button">
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="new-form__camera__container">
                <video id="camera-video" class="new-form__camera__video">
                  Video stream not available.
                </video>

                 <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
 
                <div class="new-form__camera__tools">
                  <select id="camera-select"></select>
                  <div class="new-form__camera__tools_buttons">
                    <button id="camera-take-button" class="btn" type="button">
                      Ambil Gambar
                    </button>
                  </div>
                </div>
                </div>
                <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
              </div>
            </div>
            <div class="form-control">
              <div class="new-form__location__title">Lokasi</div>

              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="map" class="new-form__location__map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="latitude" value="-6.175389" disabled>
                  <input type="number" name="longitude" value="106.827139" disabled>
                </div>
              </div>
            </div>
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Buat Laporan</button>
              </span>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryAPI,
    });
    this.#takenDocumentations = null;

    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  #setupCamera() {
    if (this.#camera) {
      return;
    }
    this.#camera = new Camera({
      video: document.getElementById("camera-video"),
      cameraSelect: document.getElementById("camera-select"),
      canvas: document.getElementById("camera-canvas"),
    });

    this.#camera.addCheeseButtonListener("#camera-take-button", async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 15,
      locate: true,
    });

    const centerCoordinate = this.#map.getCenter();

    this.#updateLatLngInput(
      centerCoordinate.latitude,
      centerCoordinate.longitude
    );
    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: "true" }
    );

    draggableMarker.addEventListener("move", (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);
    });

    this.#map.addMapEventListener("click", (event) => {
      draggableMarker.setLatLng(event.latlng);

      event.sourceTarget.flyTo(event.latlng);
    });
  }

  #setupForm() {
    this.#form = document.getElementById("new-form");
    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Validate that a photo was taken/selected
      if (!this.#takenDocumentations) {
        Swal.fire({
          title: "Error!",
          text: "Please take or select a photo first",
          icon: "error",
        });
        return;
      }

      const data = {
        description: this.#form.elements.namedItem("description").value,
        photo: this.#takenDocumentations.blob,
        latitude: this.#form.elements.namedItem("latitude").value,
        longitude: this.#form.elements.namedItem("longitude").value,
      };

      console.log(data);
      await this.#presenter.postNewStory(data);
    });

    document
      .getElementById("documentations-input")
      .addEventListener("change", async (event) => {
        const insertingPicturesPromises = Object.values(event.target.files).map(
          async (file) => {
            return await this.#addTakenPicture(file);
          }
        );
        await Promise.all(insertingPicturesPromises);

        await this.#populateTakenPictures();
      });

    document
      .getElementById("documentations-input-button")
      .addEventListener("click", () => {
        this.#form.elements.namedItem("documentations-input").click();
      });

    const cameraContainer = document.getElementById("camera-container");
    document
      .getElementById("open-documentations-camera-button")
      .addEventListener("click", async (event) => {
        cameraContainer.classList.toggle("open");

        this.#isCameraOpen = cameraContainer.classList.contains("open");
        if (this.#isCameraOpen) {
          event.currentTarget.textContent = "Tutup Kamera";

          this.#setupCamera();
          this.#camera.launch();

          return;
        }

        event.currentTarget.textContent = "Buka Kamera";
        this.#camera.stop();
      });
  }

  async #addTakenPicture(image) {
    if (!image) {
      console.warn("⚠️ No image provided!");
      return;
    }

    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, "image/png");
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenDocumentations = newDocumentation;
  }

  async #populateTakenPictures() {
    let html = "";

    if (this.#takenDocumentations) {
      const imageUrl = URL.createObjectURL(this.#takenDocumentations.blob);
      html = `
      <li class="new-form__documentations__outputs-item">
        <button type="button" id="delete-photo" class="new-form__documentations__outputs-item__delete-btn">
          <img src="${imageUrl}" alt="Dokumentasi">
        </button>
      </li>
    `;
    }

    document.getElementById("documentations-taken-list").innerHTML = html;

    const deleteButton = document.getElementById("delete-photo");
    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        this.#takenDocumentations = null;
        document.getElementById("documentations-input").value = "";
        this.#populateTakenPictures();
      });
    }
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem("latitude").value = latitude;
    this.#form.elements.namedItem("longitude").value = longitude;
  }

  storeSuccessfully(message) {
    console.log(message);
    this.clearForm();

    // Redirect page
    location.href = "/";
  }

  storeFailed(message) {
    Swal.fire({
      title: "Error!",
      text: message,
      icon: "error",
    });
  }

  clearForm() {
    this.#form.reset();
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Add Story
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Add Story</button>
    `;
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }
}
