import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
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
import NotFoundPage from "./not-found/not-found-page";

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
    const navList = this.#navigationDrawer.children.namedItem("navlist");

    if (!isLogin) {
      navList.innerHTML = "";
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Apakah Anda yakin ingin keluar?")) {
        getLogout();

        // Redirect
        location.hash = "/login";
      }
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "push-notification-tools"
    );
    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
      return;
    }

    document
      .getElementById("subscribe-button")
      .addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    const page = typeof route === "function" ? route() : new NotFoundPage();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender?.();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}

export default App;
