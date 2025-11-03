// /client/src/sockets/rtm.js
import { io } from "socket.io-client";

const baseURL =
  import.meta.env.VITE_API_BASE?.replace("/api", "") || "http://localhost:4000";

export const socket = io(baseURL, {
  withCredentials: true,
  autoConnect: false,
});
