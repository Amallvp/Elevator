import { Router } from "express";
import * as TripCtl from "../controllers/tripController.js";
import { auth } from "../middleware/auth.js";

const r = Router();
r.get("/", auth(false), TripCtl.list);
r.get("/:id", auth(false), TripCtl.get);
export default r;
