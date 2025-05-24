export default class HomeView {
  constructor() {
    this.onRetry = null;
    this.onNavigate = null;
  }
  getTemplate() {
    return `
      <section class="home-page" aria-labelledby="homepage-title">
        <div id="main-map" class="main-map" aria-label="Stories location map"></div>
        <h1 id="homepage-title">Latest Stories</h1>
        <div class="story-list-container"></div>
      </section>
    `;
  }

  setRetryHandler(handler) {
    this.onRetry = handler;
  }

  setNavigationHandler(handler) {
    this.onNavigate = handler;
  }

  navigateTo(route) {
    window.location.hash = `#${route}`;
  }

  getStoryListContainer() {
    return document.querySelector(".story-list-container");
  }

  showLoading() {
    const container = this.getStoryListContainer();
    container.innerHTML = `
      <div class="loading-state" aria-live="polite">
        <div class="spinner"></div>
        <p>Loading stories...</p>
      </div>
    `;
  }

  displayStories(stories) {
    const container = this.getStoryListContainer();

    if (!stories || stories.length === 0) {
      container.innerHTML = this.getEmptyStateTemplate();
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => `
      <article class="story-card">
        <img src="${story.photoUrl}" alt="${story.description}" loading="lazy">
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <small>${new Date(story.createdAt).toLocaleString()}</small>
      </article>
    `
      )
      .join("");
  }

  async initMainMap(stories) {
    try {
      const Map = (await import("../../utils/map")).default;
      const mainMap = await Map.build("#main-map", { zoom: 5 });

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          mainMap.addMarker([story.lat, story.lon], {
            popup: {
              content: `<b>${story.name}</b><br>${story.description}`,
              className: "story-popup",
            },
          });
        }
      });

      return mainMap;
    } catch (error) {
      console.error("Failed to initialize main map:", error);
      return null;
    }
  }

  showError(error) {
    const container = this.getStoryListContainer();
    container.innerHTML = `
      <div class="error-state" role="alert" aria-live="assertive">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Error Loading Stories</h2>
        <p>${error.message || "Please try again later"}</p>
        <button id="retry-btn" class="btn btn-primary">Retry</button>
      </div>
    `;

    document.getElementById("retry-btn")?.addEventListener("click", () => {
      this.onRetry?.();
    });
  }

  navigateToLogin() {
    window.location.hash = "#/login";
  }

  setRetryHandler(handler) {
    this.onRetry = handler;
  }
}
