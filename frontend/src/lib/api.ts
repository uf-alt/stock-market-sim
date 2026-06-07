import axios from "axios";

// Module-level token — set by auth store on login/logout/hydration
let _token: string | null = null;

export function setAuthToken(token: string | null) {
  _token = token;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

export default api;
