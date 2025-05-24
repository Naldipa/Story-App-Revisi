export default class StoryView {
  constructor() {
    this.storyList = document.createElement("div");
    this.storyList.className = "story-list";
  }

  initializeStoryMaps() {
    if (typeof L === "undefined") return;
    
    const mapElements = this.storyList.querySelectorAll('[id^="map-"]');
    mapElements.forEach((mapEl) => {
      const lat = parseFloat(mapEl.dataset.lat);
      const lon = parseFloat(mapEl.dataset.lon);
      const name = mapEl.dataset.name;
      const description = mapEl.dataset.description;

      if (!isNaN(lat) && !isNaN(lon) && typeof L !== "undefined") {
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
          .bindPopup(`<b>${name}</b><br>${description}`)
          .openPopup();
      }
    });
  }

  getElement() {
    return this.storyList;
  }

  showLoading() {
    this.storyList.innerHTML = `
      <div class="loading-state" aria-live="polite">
        <div class="loading-spinner"></div>
        <p>Loading stories...</p>
      </div>
    `;
  }

  displayStories(stories) {
    this.storyList.innerHTML = stories
      .map(
        (story) => `
        <article class="story-card">
          <img src="${story.photoUrl}"
               alt="${story.description || "Story image"}"
               class="story-image"
               loading="lazy">
          <div class="story-content">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <time datetime="${new Date(story.createdAt).toISOString()}">
              ${new Date(story.createdAt).toLocaleDateString()}
            </time>
            <div 
              id="map-${story.id}" 
              class="story-map" 
              data-lat="${story.lat}" 
              data-lon="${story.lon}" 
              data-name="${story.name}" 
              data-description="${story.description}">
            </div>
          </div>
        </article>
      `
      )
      .join("");
  }

  showError(error) {
    this.storyList.innerHTML = `
      <div class="error-state" role="alert">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>${error.status === 401 ? "Authentication Required" : "Error"}</h2>
        <p>${error.message || "Failed to load stories"}</p>
        ${
          error.status === 401
            ? '<a href="#/login" class="btn btn-primary">Login</a>'
            : '<button id="retry-btn" class="btn btn-primary">Retry</button>'
        }
      </div>
    `;
  }
}
