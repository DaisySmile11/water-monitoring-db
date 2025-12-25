import { Router } from "express";
import {
  evaluateReading,
  getAlerts,
  getAlertSettings,
  upsertAlertSettings
} from "../controllers/alertsController";

const router = Router();

// Settings per device
router.get("/settings/:deviceId", getAlertSettings);
router.put("/settings/:deviceId", upsertAlertSettings);

// Evaluate a reading (called by frontend poller)
router.post("/evaluate", evaluateReading);

// Alerts history
router.get("/", getAlerts);

export default router;
