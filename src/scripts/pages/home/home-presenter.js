export default class HomePresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    this.isLoading = false;

    // Bind view handlers
    this.view.setRetryHandler(() => this.loadStories());
    this.view.setNavigationHandler((route) => this.handleNavigation(route));
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
      await this.view.initMainMap(stories);
    } catch (error) {
      if (error.message.toLowerCase().includes("authentication")) {
        this.view.navigateTo("/login");
      } else {
        this.view.showError(error.message);
      }
    } finally {
      this.isLoading = false;
    }
  }
  handleNavigation(route) {
    // Additional navigation logic can be added here if needed
    this.view.navigateTo(route);
  }
}
