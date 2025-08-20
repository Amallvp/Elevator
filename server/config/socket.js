import { Server } from "socket.io";

let io;
export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(",") || "*" },
  });
  io.on("connection", (socket) => {
    // UI subscribes to elevator updates
    socket.on("subscribe:elevator", (elevatorId) => {
      socket.join(`elevator:${elevatorId}`);
    });
  });
  console.log("socket.io initialized");
}
export function emitToElevator(elevatorId, event, payload) {
  if (!io) return;
  io.to(`elevator:${elevatorId}`).emit(event, payload);
}
