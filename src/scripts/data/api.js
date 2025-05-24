import CONFIG from "../config";

const ENDPOINTS = {
  ENDPOINT: `${CONFIG.BASE_URL}/stories`,
};
const token = localStorage.getItem("token");
export async function getData() {
  const fetchResponse = await fetch(ENDPOINTS.ENDPOINT, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await fetchResponse.json();
}
