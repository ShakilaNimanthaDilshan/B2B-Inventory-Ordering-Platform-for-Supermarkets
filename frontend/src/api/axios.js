import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
});

// Automatically attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // after login, save token here
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
