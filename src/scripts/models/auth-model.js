import CONFIG from "../config";

class AuthModel {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Response data
   */
  async register({ name, email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Registration failed. Please try again."
        );
      }

      return {
        success: true,
        message:
          responseData.message || "Registration successful! Please login",
        data: responseData,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(
        error.message || "Network error occurred during registration"
      );
    }
  }

  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Response data with token
   */
  async login({ email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message || "Login failed. Invalid credentials."
        );
      }

      // Handle different API response structures
      const token = responseData.loginResult?.token || responseData.token;
      if (!token) {
        throw new Error("Authentication token not received from server");
      }

      this.setAccessToken(token);
      return {
        success: true,
        token,
        user: responseData.user || responseData.loginResult?.user,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Network error occurred during login");
    }
  }

  /**
   * Store access token in localStorage
   * @param {string} token - Authentication token
   */
  setAccessToken(token) {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Get stored access token
   * @returns {string|null} The stored token or null if not found
   */
  getAccessToken() {
    return localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
  }

  /**
   * Remove access token from storage (logout)
   */
  removeAccessToken() {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if token exists and is valid
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    return !!token; // Simple check - in real app you might verify token expiry
  }

  /**
   * Get current user data (if stored)
   * @returns {Object|null} User data or null if not available
   */
  getCurrentUser() {
    const userData = localStorage.getItem(`${CONFIG.ACCESS_TOKEN_KEY}_user`);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Store user data
   * @param {Object} userData - User data to store
   */
  setCurrentUser(userData) {
    localStorage.setItem(
      `${CONFIG.ACCESS_TOKEN_KEY}_user`,
      JSON.stringify(userData)
    );
  }
}

export default AuthModel;
