import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import router from "../routes/configRoute.js";
import { errorHandler, notFound } from "../handlers/error.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" , credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", router);
app.use(notFound);
app.use(errorHandler);

export default app;
