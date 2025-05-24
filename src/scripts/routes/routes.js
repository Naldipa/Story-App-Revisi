import AboutPage from "../pages/about/about-page.js";
import HomePage from "../pages/home/home-page.js";
import AddPage from "../pages/add/add-page.js";
import LoginPage from "../pages/auth/login/login-page.js";
import RegisterPage from "../pages/auth/register/register-page.js";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";

const routes = {
  // Public routes
  "/": {
    component: () => new HomePage(),
    authRequired: false,
  },
  "/about": {
    component: () => new AboutPage(),
    authRequired: false,
  },

  // Authenticated routes
  "/add": {
    component: () => new AddPage(),
    authRequired: true,
  },

  // Auth pages
  "/login": {
    component: () => new LoginPage(),
    authRequired: false,
    unauthenticatedOnly: true,
  },
  "/register": {
    component: () => new RegisterPage(),
    authRequired: false,
    unauthenticatedOnly: true,
  },
};

/**
 * Get route configuration for the current path
 * @param {string} path
 * @returns {Object|null} Route configuration or null if not found
 */
export function getRouteConfig(path) {
  const route = routes[path];

  if (!route) return null;

  if (route.authRequired && !checkAuthenticatedRoute()) {
    window.location.hash = "/login";
    return null;
  }

  return route;
}

/**
 * Get all available routes
 * @returns {Object} All routes configuration
 */
export function getAllRoutes() {
  return routes;
}

export default {
  getRouteConfig,
  getAllRoutes,
};
