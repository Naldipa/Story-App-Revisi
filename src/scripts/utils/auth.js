import CONFIG from "../config";

export function checkAuthenticatedRoute() {
  const token = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
  return !!token;
}

export function redirectIfUnauthenticated() {
  if (!checkAuthenticatedRoute()) {
    window.location.hash = "/login";
    return false;
  }
  return true;
}
