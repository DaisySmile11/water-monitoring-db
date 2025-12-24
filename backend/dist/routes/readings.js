"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const readingsController_1 = require("../controllers/readingsController");
const router = (0, express_1.Router)();
router.get("/latest", readingsController_1.getLatestReading);
router.get("/", readingsController_1.getReadings);
router.post("/", readingsController_1.createReading);
exports.default = router;
