import LoginPresenter from './login-presenter';

export default class LoginPage {
  constructor() {
    this.presenter = new LoginPresenter();
  }

  async render() {
    return `
      <section class="auth-container">
        <h1 tabindex="0">Login</h1>
        <form id="loginForm" aria-labelledby="loginHeading">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              required
              aria-required="true"
              autocomplete="username"
            >
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              required
              aria-required="true"
              autocomplete="current-password"
            >
          </div>
          <button type="submit" id="loginButton" class="btn btn-primary">
            <span id="loginText">Login</span>
            <span id="loginSpinner" class="loading-spinner" style="display:none"></span>
          </button>
        </form>
        <p>Don't have an account? <a href="#/register">Register here</a></p>
      </section>
    `;
  }

  async afterRender() {
    this.bindLoginHandler();
  }

  bindLoginHandler() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      this.showLoading(true);

      try {
        await this.presenter.handleLogin(email, password);
        this.navigateToHome();
      } catch (error) {
        this.showError(error.message);
      } finally {
        this.showLoading(false);
      }
    });
  }

  showLoading(show) {
    const loginButton = document.getElementById("loginButton");
    const loginText = document.getElementById("loginText");
    const loginSpinner = document.getElementById("loginSpinner");

    if (loginButton && loginText && loginSpinner) {
      loginButton.disabled = show;
      loginText.textContent = show ? "Logging in..." : "Login";
      loginSpinner.style.display = show ? "inline-block" : "none";
    }
  }

  showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.setAttribute("role", "alert");

    const form = document.getElementById("loginForm");
    if (form) {
      const existingError = form.querySelector(".error-message");
      if (existingError) existingError.remove();

      form.prepend(errorElement);
      setTimeout(() => errorElement.remove(), 5000);
    }
  }

  navigateToHome() {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = "#/";
      });
    } else {
      window.location.hash = "#/";
    }
  }
}