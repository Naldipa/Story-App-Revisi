import AuthModel from "../../../models/auth-model";

export default class LoginPresenter {
  constructor() {
    this.authModel = new AuthModel();
  }

  async handleLogin(email, password) {
    try {
      const { token } = await this.authModel.login({ email, password });
      return { token };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
}
