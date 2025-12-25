"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const readings_1 = __importDefault(require("./routes/readings"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const schema_1 = require("./schema");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Bootstrap DB schema for alerting features (best-effort)
(0, schema_1.ensureSchema)().catch((e) => console.error("Failed to ensure schema", e));
// Healthcheck
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "water-monitoring-backend" });
});
// API routes
app.use("/api/readings", readings_1.default);
app.use("/api/alerts", alerts_1.default);
// Serve React build (single URL deployment)
const FRONTEND_DIST = path_1.default.join(__dirname, "../../frontend/water-monitoring-frontend/dist");
app.use(express_1.default.static(FRONTEND_DIST));
// IMPORTANT: must be after API routes
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(FRONTEND_DIST, "index.html"));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
});
