import LoginPresenter from "./login-presenter";
import * as StoryAPI from "../../../data/api";
import * as AuthModel from "../../../utils/auth";

export default class LoginPage {
  #presenter = null;

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
          <div id="submit-button-container">
            <button type="submit" class="btn" id="loginButton">
              Masuk
            </button>
          </div>
        </form>
        <p>Don't have an account? <a href="#/register">Register here</a></p>
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
