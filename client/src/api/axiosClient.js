import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5050/api"
});

// Attach JWT token to requests
axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("mentora_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
