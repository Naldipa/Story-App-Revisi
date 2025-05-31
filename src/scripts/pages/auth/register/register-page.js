import RegisterPresenter from "./register-presenter";
import * as StoryAPI from "../../../data/api";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
    <section class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">Create Account</h1>
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name-input" class="form-label">Full Name</label>
            <input 
              id="name-input" 
              type="text" 
              name="name" 
              class="form-input"
              placeholder="Enter your full name"
              required
            >
          </div>
          <div class="form-group">
            <label for="email-input" class="form-label">Email</label>
            <input 
              id="email-input" 
              type="email" 
              name="email" 
              class="form-input"
              placeholder="example@email.com"
              required
            >
          </div>
          <div class="form-group">
            <label for="password-input" class="form-label">Password</label>
            <input 
              id="password-input" 
              type="password" 
              name="password" 
              class="form-input"
              placeholder="Create a password"
              required
            >
          </div>
          <div id="submit-button-container" class="form-submit">
            <button type="submit" class="btn btn-auth">
              Register
            </button>
          </div>
        </form>
        <p class="auth-footer">Already have an account? <a href="#/login" class="auth-link">Login here</a></p>
      </div>
    </section>
  `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          name: document.getElementById("name-input").value,
          email: document.getElementById("email-input").value,
          password: document.getElementById("password-input").value,
        };
        await this.#presenter.getRegistered(data);
      });
  }

  registeredSuccessfully(message) {
    console.log(message);

    // Redirect
    location.hash = "/login";
  }

  registeredFailed(message) {
    alert(message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Daftar akun
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Daftar akun</button>
    `;
  }
}
