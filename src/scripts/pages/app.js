import { resolveRoute } from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateUnsubscribeButtonTemplate,
} from "../templates";
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from "../utils";
import { getAccessToken, getLogout } from "../utils/auth";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.querySelector("#navlist");

    if (!isLogin) {
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = `
 <li>
    <a href="#/" class="nav-button story-list-button">
      <i class="fas fa-list"></i> Story List
    </a>
  </li>
  ${generateAuthenticatedNavigationListTemplate()}
  `;

    const logoutButton = document.querySelector(".logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar?")) {
          getLogout();
          location.hash = "/login";
        }
      });
    }
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "push-notification-tools"
    );
    if (!pushNotificationTools) return;

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      const unsubscribeButton = document.getElementById("unsubscribe-button");
      if (unsubscribeButton) {
        unsubscribeButton.addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
      }
      return;
    }

    const subscribeButton = document.getElementById("subscribe-button");
    if (subscribeButton) {
      subscribeButton.addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
    }
  }

  async renderPage() {
    try {
      const url = getActiveRoute();
      const page = resolveRoute(url); // Gunakan resolveRoute langsung

      if (!page) {
        console.error("Page is null, showing fallback");
        this.#showFallbackPage();
        return;
      }

      const transition = transitionHelper({
        updateDOM: async () => {
          this.#content.innerHTML = await page.render();
          await page.afterRender?.();
        },
      });

      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        this.#setupNavigationList();
        if (isServiceWorkerAvailable()) {
          this.#setupPushNotification();
        }
      });
    } catch (error) {
      console.error("Render error:", error);
      this.#showFallbackPage();
    }
  }

  #showFallbackPage() {
    if (!this.#content) {
      console.error("Content element not found");
      return;
    }

    this.#content.innerHTML = `
    <section class="not-found-container">
      <div class="not-found-content">
        <h1>Error</h1>
        <p>Unable to load the page. Please try again.</p>
        <a href="#/" class="btn">Home</a>
      </div>
    </section>
  `;
  }
}

export default App;
