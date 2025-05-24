export default class AddStoryView {
  getTemplate() {
    return `
      <section class="add-story-page" aria-labelledby="form-title">
        ${this.getFormTemplate()}
      </section>
    `;
  }

  getFormTemplate() {
    return `
      <form id="story-form" aria-labelledby="form-title" class="add-story-form">
        <h1 id="form-title" tabindex="-1">Add New Story</h1>
        
        <div class="form-group">
          <label for="description" class="required">Story Description</label>
          <textarea 
            id="description" 
            name="description" 
            required
            aria-required="true"
            minlength="10"
            maxlength="1000"
            placeholder="Tell your story (minimum 10 characters)"
            aria-describedby="desc-help"
          ></textarea>
          <small id="desc-help" class="help-text">Describe your experience in detail</small>
        </div>
        
        <fieldset class="form-group" aria-labelledby="camera-label">
          <legend id="camera-label" class="required">Story Photo</legend>
          <div class="camera-container">
            <div class="camera-preview-wrapper">
              <video 
                id="camera-preview" 
                autoplay 
                playsinline
                aria-label="Camera preview"
                class="camera-view"
              ></video>
              <canvas 
                id="photo-canvas" 
                style="display:none" 
                aria-hidden="true"
              ></canvas>
              <div id="photo-preview" class="photo-preview" style="display:none" role="img" aria-label="Captured photo"></div>
            </div>
            
            <div class="camera-controls">
              <button 
                type="button" 
                id="capture-btn" 
                class="btn btn-primary"
                aria-label="Take photo"
              >
                <i class="fas fa-camera" aria-hidden="true"></i> Take Photo
              </button>
              <button 
                type="button" 
                id="retake-btn" 
                class="btn btn-secondary"
                style="display:none"
                aria-label="Retake photo"
              >
                <i class="fas fa-redo" aria-hidden="true"></i> Retake
              </button>
            </div>
          </div>
        </fieldset>
        
        <fieldset class="form-group" aria-labelledby="location-label">
          <legend id="location-label">Story Location</legend>
          <div id="map" class="story-map" aria-label="Location selection map"></div>
          <div class="location-coordinates">
            <input type="hidden" id="lat" name="lat" aria-label="Latitude">
            <input type="hidden" id="lon" name="lon" aria-label="Longitude">
            <div id="location-display" class="location-display" aria-live="polite">
              No location selected
            </div>
          </div>
        </fieldset>
        
        <div class="form-actions">
          <button type="submit" id="submit-btn" class="btn btn-primary" aria-label="Submit story">
            <span id="submit-text">Submit Story</span>
            <span id="submit-spinner" class="loading-spinner" aria-hidden="true" style="display:none"></span>
          </button>
          <button type="button" id="cancel-btn" class="btn btn-secondary" aria-label="Cancel and go back">
            Cancel
          </button>
        </div>
      </form>
    `;
  }

  // DOM element getters
  getCameraPreviewElement() {
    return document.getElementById("camera-preview");
  }

  getPhotoCanvasElement() {
    return document.getElementById("photo-canvas");
  }

  getMapElementSelector() {
    return "#map";
  }

  // Location methods
  updateLocationInputs(lat, lng) {
    document.getElementById("lat").value = lat;
    document.getElementById("lon").value = lng;
  }

  disableLocationInputs() {
    document.getElementById("lat").disabled = true;
    document.getElementById("lon").disabled = true;
  }

  updateMapMarker(lat, lng) {
    const locationDisplay = document.getElementById("location-display");
    if (locationDisplay) {
      locationDisplay.textContent = `Location: ${lat.toFixed(4)}, ${lng.toFixed(
        4
      )}`;
    }
  }

  // Event binding methods
  bindFormSubmitHandler(handler) {
    const form = document.getElementById("story-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handler(new FormData(form));
    });
  }

  bindCancelHandler(handler) {
    const cancelBtn = document.getElementById("cancel-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", handler);
    }
  }

  bindCapturePhotoHandler(captureHandler) {
    const captureBtn = document.getElementById("capture-btn");
    const retakeBtn = document.getElementById("retake-btn");
    const photoPreview = document.getElementById("photo-preview");
    const cameraPreview = this.getCameraPreviewElement();

    if (captureBtn) {
      captureBtn.addEventListener("click", async () => {
        try {
          captureBtn.disabled = true;
          captureBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Capturing...';

          const photoBlob = await captureHandler();
          const photoUrl = URL.createObjectURL(photoBlob);

          // Show captured photo
          photoPreview.style.backgroundImage = `url(${photoUrl})`;
          photoPreview.style.display = "block";
          cameraPreview.style.display = "none";
          captureBtn.style.display = "none";
          retakeBtn.style.display = "inline-block";
        } catch (error) {
          this.showError(error.message);
        } finally {
          captureBtn.disabled = false;
          captureBtn.innerHTML = '<i class="fas fa-camera"></i> Take Photo';
        }
      });
    }

    if (retakeBtn) {
      retakeBtn.addEventListener("click", () => {
        photoPreview.style.backgroundImage = "";
        photoPreview.style.display = "none";
        cameraPreview.style.display = "block";
        captureBtn.style.display = "inline-block";
        retakeBtn.style.display = "none";
      });
    }
  }

  // UI state methods
  showLoading(show = true) {
    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
      submitBtn.disabled = show;
      document.getElementById("submit-spinner").style.display = show
        ? "inline-block"
        : "none";
      document.getElementById("submit-text").textContent = show
        ? "Submitting..."
        : "Submit Story";
    }
  }

  showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.setAttribute("role", "alert");

    const form = document.getElementById("story-form");
    if (form) {
      const existingError = form.querySelector(".error-message");
      if (existingError) existingError.remove();

      form.prepend(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    }
  }

  showSuccess(message) {
    const successElement = document.createElement("div");
    successElement.className = "success-message";
    successElement.textContent = message;
    successElement.setAttribute("role", "status");

    const form = document.getElementById("story-form");
    if (form) {
      const existingSuccess = form.querySelector(".success-message");
      if (existingSuccess) existingSuccess.remove();

      form.prepend(successElement);
      setTimeout(() => successElement.remove(), 3000);
    }
  }
}
