import { getRouteConfig } from "./scripts/routes/routes";
import { getActiveRoute } from "./scripts/routes/url-parser";
import { transitionHelper } from "./scripts/utils/transition";
import { checkAuthenticatedRoute } from "./scripts/utils/auth";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;
  #isRendering = false;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupNavigation();
    this._setupGlobalErrorHandlers();
  }

  _setupDrawer() {
    try {
      this.#drawerButton.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = this.#navigationDrawer.classList.toggle("open");
        this.#drawerButton.setAttribute("aria-expanded", isOpen);

        if (isOpen) {
          const firstNavItem = this.#navigationDrawer.querySelector("a");
          firstNavItem?.focus();
        }
      });

      document.addEventListener("click", (event) => {
        if (!this.#navigationDrawer.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
          this.#drawerButton.setAttribute("aria-expanded", "false");
        }
      });

      this.#navigationDrawer.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.#navigationDrawer.classList.remove("open");
          this.#drawerButton.setAttribute("aria-expanded", "false");
          this.#drawerButton.focus();
        }
      });
    } catch (error) {
      console.error("Drawer setup failed:", error);
    }
  }

  _setupNavigation() {
    window.addEventListener("hashchange", () => {
      if (!this.#isRendering) {
        this.renderPage();
      }
    });
  }

  _setupGlobalErrorHandlers() {
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      this._showFatalError(event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled rejection:", event.reason);
      this._showFatalError(event.reason);
    });
  }

  async #cleanupPreviousPage() {
    try {
      if (this.#currentPage?.cleanup) {
        await this.#currentPage.cleanup();
      }
    } catch (error) {
      console.error("Cleanup failed:", error);
    } finally {
      this.#currentPage = null;
    }
  }

  async renderPage() {
    if (this.#isRendering) return;
    this.#isRendering = true;

    try {
      const path = getActiveRoute();
      const routeConfig = getRouteConfig(path);

      if (!routeConfig) {
        window.location.hash = "/";
        return;
      }

      // Check authentication before rendering
      if (routeConfig.authRequired && !checkAuthenticatedRoute()) {
        window.location.hash = "/login";
        return;
      }

      await this.#cleanupPreviousPage();

      const transition = transitionHelper({
        updateDOM: async () => {
          try {
            this.#content.innerHTML = "";
            this.#currentPage = routeConfig.component();
            const html = await this.#currentPage.render();
            this.#content.innerHTML = html;
            this._setFocusToMainContent();
          } catch (renderError) {
            console.error("DOM update failed:", renderError);
            throw renderError;
          }
        },
      });

      await transition.finished;

      try {
        if (this.#currentPage?.afterRender) {
          await this.#currentPage.afterRender();
        }
      } catch (afterRenderError) {
        console.error("afterRender failed:", afterRenderError);
        this._handleAfterRenderError(afterRenderError);
      }
    } catch (error) {
      console.error("Page rendering failed:", error);
      this._handleRenderError(error);
    } finally {
      this.#isRendering = false;
    }
  }

  _setFocusToMainContent() {
    requestAnimationFrame(() => {
      const mainContent = this.#content;
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.removeAttribute("tabindex");

      // Scroll ke konten utama
      mainContent.scrollIntoView();
    });
  }

  _handleRenderError(error) {
    if (
      error.message.includes("Authentication") ||
      error.message.includes("Session expired")
    ) {
      // Auth-related errors
      this._showAuthError(error);
      window.location.hash = "/login";
    } else if (error.message.includes("Network")) {
      // Network errors
      this._showNetworkError();
    } else {
      // Generic errors
      this._showErrorState({
        title: "Page Load Failed",
        message: error.message,
        actions: [
          { text: "Try Again", action: () => window.location.reload() },
          { text: "Go Home", action: () => (window.location.hash = "/") },
        ],
      });
    }
  }

  _handleAfterRenderError(error) {
    this._showErrorState({
      title: "Content Load Failed",
      message: error.message,
      actions: [
        { text: "Retry", action: () => this.#currentPage.afterRender() },
        { text: "Home", action: () => (window.location.hash = "/") },
      ],
    });
  }

  _showAuthError(error) {
    this.#content.innerHTML = `
      <div class="error-state auth-error">
        <h2>Authentication Required</h2>
        <p>${error.message || "Please login to access this page"}</p>
        <div class="action-buttons">
          <a href="#/login" class="btn btn-primary">Login</a>
          <a href="#/" class="btn btn-secondary">Home</a>
        </div>
      </div>
    `;
  }

  _showNetworkError() {
    this.#content.innerHTML = `
      <div class="error-state network-error">
        <h2>Network Connection Failed</h2>
        <p>Please check your internet connection and try again</p>
        <div class="action-buttons">
          <button class="btn btn-primary" id="retry-button">Retry</button>
          <a href="#/" class="btn btn-secondary">Home</a>
        </div>
      </div>
    `;

    document.getElementById("retry-button")?.addEventListener("click", () => {
      window.location.reload();
    });
  }

  _showErrorState({ title, message, actions }) {
    this.#content.innerHTML = `
      <div class="error-state">
        <h2>${title}</h2>
        <p>${message}</p>
        <div class="action-buttons">
          ${actions
            .map(
              (action) => `
            <button class="btn ${
              action === actions[0] ? "btn-primary" : "btn-secondary"
            }" 
                    onclick="${action.action.toString()}">
              ${action.text}
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  _showFatalError(error) {
    document.body.innerHTML = `
      <div class="fatal-error">
        <h1>Application Error</h1>
        <p>The application has encountered a critical error</p>
        <div class="error-message">${error.message}</div>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Reload Application
        </button>
      </div>
    `;
  }
}

export default App;
