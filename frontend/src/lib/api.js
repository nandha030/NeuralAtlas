import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, withCredentials: true });

// Bearer token from localStorage (fallback to cookie auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("na_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
