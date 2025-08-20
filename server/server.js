import http from "http";
import app from "./setup/app.js";
import { initSocket } from "./config/socket.js";
import { connectMongo } from "./config/db.js";
import { initMqtt } from "./config/mqtt.js";

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 8080;
await connectMongo();

if (process.env.ENABLE_MQTT === "true") {
  initMqtt();
}

server.listen(PORT, () => {
  console.log(`http listening on :${PORT}`);
});
