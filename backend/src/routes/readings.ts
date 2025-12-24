import { Router } from "express";
import { getLatestReading, getReadings, createReading } from "../controllers/readingsController";

const router = Router();

router.get("/latest", getLatestReading);
router.get("/", getReadings);
router.post("/", createReading);

export default router;
