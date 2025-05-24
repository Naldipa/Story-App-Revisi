import CONFIG from "../config";

export default class StoryModel {
  async getAllStories(params = {}) {
    try {
      const token = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);

      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${CONFIG.BASE_URL}/stories?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stories");
      }

      const responseData = await response.json();

      if (!responseData.listStory) {
        throw new Error("Invalid stories data format from server");
      }

      return responseData.listStory;
    } catch (error) {
      console.error("StoryModel.getAllStories error:", error);

      // Enhanced error handling
      let errorMessage = error.message;
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      throw new Error(errorMessage);
    }
  }

  async addStory({ description, photo, lat, lon }) {
    try {
      const token = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      // Validate required fields
      if (!description || description.trim().length < 10) {
        throw new Error("Description must be at least 10 characters");
      }

      if (!photo) {
        throw new Error("Photo is required");
      }

      // Validate coordinates
      if ((lat && !lon) || (!lat && lon)) {
        throw new Error("Please provide both latitude and longitude or none");
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo, "story-photo.jpg");

      if (lat && lon) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add story");
      }

      const responseData = await response.json();

      if (!responseData.message) {
        throw new Error("Invalid response format from server");
      }

      return responseData;
    } catch (error) {
      console.error("StoryModel.addStory error:", error);

      // Enhanced error handling
      let errorMessage = error.message;
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      throw new Error(errorMessage);
    }
  }
}
