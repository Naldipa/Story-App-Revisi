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
import NotFoundPage from "../pages/not-found/not-found-page";

const routes = {
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/story/:id": () => checkAuthenticatedRoute(new StoryDetailPage()),
  "/new": () => checkAuthenticatedRoute(new NewPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
};

export const resolveRoute = (path) => {
  const routeKeys = Object.keys(routes);
  const matchedRoute = routeKeys.find((route) => {
    if (route.includes(":")) {
      const regex = new RegExp(`^${route.replace(/:\w+/g, "[^/]+")}$`);
      return regex.test(path);
    }
    return route === path;
  });

  return matchedRoute ? routes[matchedRoute]() : new NotFoundPage();
};

export default routes;
