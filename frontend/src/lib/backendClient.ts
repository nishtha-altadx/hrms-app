import axios from "axios";
import { getToken } from "./tokenStorage";

export const backendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

backendClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
