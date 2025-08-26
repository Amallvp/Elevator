import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constant";

// Connect to backend (replace with your server URL)
const socket = io(`${SOCKET_URL}`, {
  transports: ["websocket"], // ensures real-time connection
   withCredentials: true,
});

export default socket;