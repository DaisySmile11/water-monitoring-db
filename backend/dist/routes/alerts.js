"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alertsController_1 = require("../controllers/alertsController");
const router = (0, express_1.Router)();
// Settings per device
router.get("/settings/:deviceId", alertsController_1.getAlertSettings);
router.put("/settings/:deviceId", alertsController_1.upsertAlertSettings);
// Evaluate a reading (called by frontend poller)
router.post("/evaluate", alertsController_1.evaluateReading);
// Alerts history
router.get("/", alertsController_1.getAlerts);
exports.default = router;
