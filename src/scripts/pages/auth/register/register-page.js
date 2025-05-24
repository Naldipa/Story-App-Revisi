import AuthModel from "../../../models/auth-model";

export default class RegisterPage {
  async render() {
    return `
      <section class="auth-container">
        <h1 tabindex="0">Register</h1>
        <form id="registerForm" aria-labelledby="registerHeading">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              required
              aria-required="true"
            >
          </div>
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
            <label for="password">Password (min 6 characters)</label>
            <input 
              type="password" 
              id="password" 
              minlength="6"
              required
              aria-required="true"
              autocomplete="new-password"
            >
          </div>
          <button type="submit" id="registerButton">Register</button>
        </form>
        <p>Already have an account? <a href="#/login">Login here</a></p>
      </section>
    `;
  }

  async afterRender() {
    const authModel = new AuthModel();
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const registerButton = document.getElementById("registerButton");

      try {
        registerButton.disabled = true;
        registerButton.innerHTML = "Registering...";

        await authModel.register({
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        });

        alert("Registration successful! Please login");
        window.location.hash = "#/login";
      } catch (error) {
        alert(`Registration failed: ${error.message}`);
      } finally {
        registerButton.disabled = false;
        registerButton.innerHTML = "Register";
      }
    });
  }
}
