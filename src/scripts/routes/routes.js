import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/auth/login/login-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";
import RegisterPage from "../pages/auth/register/register-page";
import StoryDetailPage from "../pages/story-detail/story-detail-page";
import NewPage from "../pages/new/new-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import AboutPage from "../pages/not-found/not-found-page";

const routes = {
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/story/:id": () => checkAuthenticatedRoute(new StoryDetailPage()),
  "/new": () => checkAuthenticatedRoute(new NewPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
};

const matchRoute = (path) => {
  const routeKeys = Object.keys(routes);
  for (const route of routeKeys) {
    if (route.includes(":")) {
      const regex = new RegExp(`^${route.replace(/:\w+/g, "[^/]+")}$`);
      if (regex.test(path)) {
        return routes[route];
      }
    } else if (route === path) {
      return routes[route];
    }
  }
  return null;
};

export const resolveRoute = (path) => {
  const matchedRoute = matchRoute(path);
  if (matchedRoute) {
    return matchedRoute();
  }
  return new AboutPage();
};

export default routes;
