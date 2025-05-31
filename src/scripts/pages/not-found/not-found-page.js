export default class NotFoundPage {
  constructor() {
    console.log("NotFoundPage initialized"); // Debugging
  }

  async render() {
    console.log("Rendering not found page"); // Debugging
    return `
      <section class="not-found-container">
        <div class="not-found-content">
          <h1 class="not-found-title">404</h1>
          <p class="not-found-subtitle">Page Not Found</p>
          <p>The requested URL ${window.location.hash} was not found</p>
          <a href="#/" class="btn btn-primary">Go Home</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log("NotFoundPage afterRender"); // Debugging
    const homeButton = document.querySelector(".btn-primary");
    if (homeButton) {
      homeButton.addEventListener("click", () => {
        window.location.hash = "/";
      });
    }
  }
}
