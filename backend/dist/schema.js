"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSchema = ensureSchema;
const db_1 = require("./db");
/**
 * Minimal schema bootstrap for alerting features.
 * Runs CREATE TABLE IF NOT EXISTS so local/dev/prod can start without manual migrations.
 */
async function ensureSchema() {
    // Alert settings per device (one row per device_id)
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS alert_settings (
      device_id TEXT PRIMARY KEY,
      salinity_high DOUBLE PRECISION,
      ph_low DOUBLE PRECISION,
      ph_high DOUBLE PRECISION,
      temperature_low DOUBLE PRECISION,
      temperature_high DOUBLE PRECISION,
      battery_low DOUBLE PRECISION,
      no_data_minutes INTEGER DEFAULT 60,
      cooldown_minutes INTEGER DEFAULT 15,
      email_to TEXT,
      enabled BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
    // Alerts history
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS alerts (
      id BIGSERIAL PRIMARY KEY,
      device_id TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      value DOUBLE PRECISION,
      threshold DOUBLE PRECISION,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      email_sent BOOLEAN DEFAULT FALSE,
      email_to TEXT
    );
  `);
    await db_1.pool.query(`
    CREATE INDEX IF NOT EXISTS idx_alerts_device_created_at
    ON alerts(device_id, created_at DESC);
  `);
}
