import LoginPresenter from "./login-presenter";
import * as StoryAPI from "../../../data/api";
import * as AuthModel from "../../../utils/auth";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
    <section class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title" tabindex="0">Login</h1>
        <form id="loginForm" class="auth-form" aria-labelledby="loginHeading">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              class="form-input"
              required
              aria-required="true"
              autocomplete="username"
              placeholder="Enter your email"
            >
          </div>
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              class="form-input"
              required
              aria-required="true"
              autocomplete="current-password"
              placeholder="Enter your password"
            >
          </div>
          <div id="submit-button-container" class="form-submit">
            <button type="submit" class="btn btn-auth" id="loginButton">
              Login
            </button>
          </div>
        </form>
        <p class="auth-footer">Don't have an account? <a href="#/register" class="auth-link">Register here</a></p>
      </div>
    </section>
  `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", this.#handleSubmit.bind(this));
  }

  async #handleSubmit(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await this.#presenter.getLogin({ email, password });
  }

  loginSuccessfully(message) {
    alert(message);
    location.hash = "/";
  }

  loginFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Loading...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" id="loginButton">
        Masuk
      </button>
    `;
  }
}
