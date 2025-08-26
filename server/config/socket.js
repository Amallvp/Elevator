import { Server } from "socket.io";
import { getHistoryData } from "../controllers/elevatorController.js";
import { getElevatorList } from "../service/elevatorService.js";

let io;
export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(",") || "*" },
  });
  io.on("connection", (socket) => {
    // UI subscribes to elevator updates
    socket.on("subscribe:elevator", (id) => {
      socket.join(`elevator:${id}`);
    });

    socket.on("get:elevatorHistory", async ({ id, limit = 500 }, callback) => {
      try {
        const rows = await getHistoryData({ id, limit });
        callback({ success: true, data: rows });
      } catch (e) {
        console.error("Socket error:", e);
        callback({ success: false, error: "Failed to fetch history" });
      }
    });
    // get elevator list (like GET API but via socket)
    socket.on("get:elevators", async (callback) => {
      try {
        const rows = await getElevatorList();
        callback({ success: true, data: rows });
      } catch (e) {
        callback({ success: false, error: "Failed to fetch elevators" });
      }
    });
  });

  console.log("socket.io initialized");
}

export function emitToElevator(elevatorId, event, payload) {
  if (!io) return;
  io.to(`elevator:${elevatorId}`).emit(event, payload);
}


// global broadcast
export function emitElevatorListUpdate() {
  if (!io) return;
  getElevatorList().then((rows) => {
    io.emit("elevators:update", rows);
  });
}