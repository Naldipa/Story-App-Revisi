// CSS imports
import "../styles/styles.css";
import App from "../app";
import { registerServiceWorker } from "./utils";

// Setup accessibility features
function setupSkipToContent() {
  const skipLink = document.querySelector(".skip-link");
  const mainContent = document.querySelector("#main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.removeAttribute("tabindex");
    });
  }
}

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  setupSkipToContent();

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  await registerServiceWorker();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
