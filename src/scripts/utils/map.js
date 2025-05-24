import L from "leaflet";
import CONFIG from "../config";
CONFIG.MAP_SERVICE_API_KEY;

// Fix Leaflet marker icons
const iconRetinaUrl = require("leaflet/dist/images/marker-icon-2x.png");
const iconUrl = require("leaflet/dist/images/marker-icon.png");
const shadowUrl = require("leaflet/dist/images/marker-shadow.png");

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// Custom error class for map-related errors
class MapError extends Error {
  constructor(message, type = "MAP_ERROR") {
    super(message);
    this.name = "MapError";
    this.type = type;
  }
}

export default class Map {
  constructor(selector, options = {}) {
    if (!selector) {
      throw new MapError(
        "Map container selector is required",
        "INVALID_SELECTOR"
      );
    }

    const container = document.querySelector(selector);
    if (!container) {
      throw new MapError(
        `Map container not found: ${selector}`,
        "CONTAINER_NOT_FOUND"
      );
    }

    try {
      this.map = L.map(container, {
        zoom: options.zoom || 13,
        scrollWheelZoom: options.scrollWheelZoom || false,
        dragging: options.dragging !== false,
        tap: options.tap !== false,
        ...options,
      });

      // Add base tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        detectRetina: true,
      }).addTo(this.map);

      if (options.center) {
        this.map.setView(L.latLng(options.center), options.zoom || 13);
      }

      // Error event handling
      this.map.on("loaderror", (e) => {
        console.error("Map load error:", e.error);
        throw new MapError("Failed to load map tiles", "TILE_LOAD_ERROR");
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      throw new MapError("Failed to initialize map", "INITIALIZATION_ERROR");
    }
  }

  static async build(selector, options = {}) {
    const defaultCenter = [-6.2, 106.816666]; // Jakarta coordinates

    try {
      if (options.locate) {
        try {
          const position = await this.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
          return new Map(selector, {
            ...options,
            center: [position.coords.latitude, position.coords.longitude],
            zoom: 15,
          });
        } catch (geolocationError) {
          console.warn(
            "Geolocation failed, using default center:",
            geolocationError
          );
        }
      }
      return new Map(selector, {
        ...options,
        center: options.center || defaultCenter,
      });
    } catch (error) {
      console.error("Map build failed:", error);
      throw error;
    }
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new MapError(
            "Geolocation is not supported by your browser",
            "GEOLOCATION_UNSUPPORTED"
          )
        );
        return;
      }
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let errorMessage = "Geolocation error";
          let errorType = "GEOLOCATION_ERROR";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Geolocation permission denied";
              errorType = "PERMISSION_DENIED";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              errorType = "POSITION_UNAVAILABLE";
              break;
            case error.TIMEOUT:
              errorMessage = "Geolocation request timed out";
              errorType = "TIMEOUT";
              break;
            default:
              errorMessage = "Unknown geolocation error";
          }

          reject(new MapError(errorMessage, errorType));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          ...options,
        }
      );
    });
  }

  addMarker(coords, options = {}) {
    if (!coords || !Array.isArray(coords)) {
      throw new MapError("Invalid coordinates format", "INVALID_COORDINATES");
    }

    try {
      const marker = L.marker(coords, {
        draggable: options.draggable || false,
        title: options.title || "",
        alt: options.alt || "Map marker",
        ...options,
      }).addTo(this.map);

      if (options.popup) {
        const popupOptions = {
          className: options.popup.className || "map-popup",
          maxWidth: 300,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          ...options.popup,
        };

        marker.bindPopup(
          L.popup(popupOptions)
            .setContent(options.popup.content || "")
            .openPopup()
        );
      }

      if (options.tooltip) {
        marker.bindTooltip(options.tooltip.content || "", {
          direction: "top",
          permanent: false,
          ...options.tooltip,
        });
      }

      return marker;
    } catch (error) {
      console.error("Failed to add marker:", error);
      throw new MapError("Failed to add marker to map", "MARKER_ERROR");
    }
  }

  on(event, callback) {
    if (!event || typeof callback !== "function") {
      throw new MapError("Invalid event parameters", "INVALID_EVENT");
    }
    this.map.on(event, callback);
    return this; // For method chaining
  }

  removeLayer(layer) {
    if (!layer) {
      throw new MapError("Layer to remove is required", "INVALID_LAYER");
    }
    try {
      this.map.removeLayer(layer);
    } catch (error) {
      console.error("Failed to remove layer:", error);
      throw new MapError(
        "Failed to remove layer from map",
        "LAYER_REMOVAL_ERROR"
      );
    }
  }

  getCenter() {
    try {
      const center = this.map.getCenter();
      return {
        lat: center.lat,
        lng: center.lng,
        toString: () => `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`,
      };
    } catch (error) {
      console.error("Failed to get map center:", error);
      throw new MapError("Failed to get map center", "CENTER_ERROR");
    }
  }

  fitBounds(bounds, options = {}) {
    if (!bounds || !Array.isArray(bounds)) {
      throw new MapError("Invalid bounds format", "INVALID_BOUNDS");
    }

    try {
      const leafletBounds = L.latLngBounds(bounds);
      this.map.fitBounds(leafletBounds, {
        padding: [20, 20],
        maxZoom: 15,
        ...options,
      });
    } catch (error) {
      console.error("Failed to fit bounds:", error);
      throw new MapError("Failed to fit map bounds", "BOUNDS_ERROR");
    }
  }

  destroy() {
    try {
      this.map.off(); // Remove all event listeners
      this.map.remove(); // Remove the map
    } catch (error) {
      console.error("Failed to destroy map:", error);
      throw new MapError("Failed to destroy map", "DESTRUCTION_ERROR");
    }
  }
}
