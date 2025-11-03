// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000/api",
  withCredentials: true,
});

export const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
export const WS = import.meta.env.VITE_API_WS || "http://localhost:4000";
