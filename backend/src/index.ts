import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import readingsRouter from "./routes/readings";
import alertsRouter from "./routes/alerts";
import { ensureSchema } from "./schema";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Bootstrap DB schema for alerting features (best-effort)
ensureSchema().catch((e) => console.error("Failed to ensure schema", e));

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "water-monitoring-backend" });
});

// API routes
app.use("/api/readings", readingsRouter);
app.use("/api/alerts", alertsRouter);

// Serve React build (single URL deployment)
const FRONTEND_DIST = path.join(__dirname, "../../frontend/water-monitoring-frontend/dist");
app.use(express.static(FRONTEND_DIST));

// IMPORTANT: must be after API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
