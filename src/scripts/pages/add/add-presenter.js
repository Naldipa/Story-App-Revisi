import Camera from "../../utils/camera";
import { transitionHelper } from "../../utils/transition";

export default class AddStoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.camera = null;
    this.map = null;
    this.currentMarker = null;
    this.isSubmitting = false;

    this.view.setNavigationHandler((route) => this.handleNavigation(route));
  }

  async handleNavigation(route) {
    this.cleanup();
    this.view.navigateTo(route);
  }

  async initialize() {
    try {
      await this.initCamera();
      await this.initMap();
      this.bindEventHandlers();
    } catch (error) {
      console.error("AddStoryPresenter initialization failed:", error);
      this.view.showError("Failed to initialize page features");
    }
  }

  async initCamera() {
    try {
      this.camera = new Camera({
        video: this.view.getCameraPreviewElement(),
        canvas: this.view.getPhotoCanvasElement(),
      });
      await this.camera.start();
      this.view.bindCapturePhotoHandler(this.camera.capture.bind(this.camera));
    } catch (error) {
      console.error("Camera initialization failed:", error);
      this.view.showError(
        "Camera access denied. Please enable camera permissions."
      );
      throw error;
    }
  }

  async initMap() {
    try {
      const Map = (await import("../../utils/map")).default;
      this.map = await Map.build(this.view.getMapElementSelector(), {
        locate: true,
      });

      this.map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        this.view.updateLocationInputs(lat, lng);
        this.view.updateMapMarker(lat, lng);

        if (this.currentMarker) {
          this.map.removeLayer(this.currentMarker);
        }

        this.currentMarker = this.map.addMarker([lat, lng], {
          popup: {
            content: "Your story location",
            className: "story-popup",
          },
        });
      });
    } catch (error) {
      console.error("Map initialization failed:", error);
      this.view.showError("Failed to load map. Location features disabled.");
      this.view.disableLocationInputs();
    }
  }

  #validateForm(formData) {
    const description = formData.get("description");
    const lat = formData.get("lat");
    const lon = formData.get("lon");

    if (!description || description.trim().length < 10) {
      this.view.showError("Description must be at least 10 characters");
      return false;
    }

    if ((lat && !lon) || (!lat && lon)) {
      this.view.showError("Please provide both latitude and longitude or none");
      return false;
    }

    return true;
  }

  async handleFormSubmit(formData) {
    if (this.isSubmitting) return;

    try {
      if (!this.#validateForm(formData)) return;

      this.isSubmitting = true;
      this.view.showLoading(true);

      const photoBlob = this.camera.getLastPhoto();
      if (!photoBlob) {
        throw new Error("No photo captured");
      }

      formData.append("photo", photoBlob, "story-photo.jpg");

      await this.model.addStory({
        description: formData.get("description"),
        photo: photoBlob,
        lat: formData.get("lat"),
        lon: formData.get("lon"),
      });

      await transitionHelper({
        updateDOM: () => {
          this.view.showSuccess("Story added successfully!");
          this.view.navigateToHome();
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
      this.view.showError(error.message || "Failed to add story");
    } finally {
      this.isSubmitting = false;
      this.view.showLoading(false);
    }
  }

  bindEventHandlers() {
    this.view.bindFormSubmitHandler((formData) =>
      this.handleFormSubmit(formData)
    );
    this.view.bindCancelHandler(() => {
      this.cleanup();
      this.view.navigateToHome();
    });
  }

  cleanup() {
    this.camera?.stop();
    this.map?.remove();
    this.currentMarker = null;
  }
}
