import { Request, Response } from "express";
import { pool } from "../db";

export async function getLatestReading(req: Request, res: Response) {
  try {
    const result = await pool.query(
      "SELECT * FROM sensor_readings ORDER BY created_at DESC LIMIT 1"
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch latest reading" });
  }
}

export async function getReadings(req: Request, res: Response) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        error: "Missing query params: from and to (ISO date string)",
        example: "/api/readings?from=2025-01-01&to=2025-12-31",
      });
    }

    const result = await pool.query(
      "SELECT * FROM sensor_readings WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at ASC",
      [from, to]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
}

export async function createReading(req: Request, res: Response) {
  try {
    const { device_id, salinity, ph, temperature, battery } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: "device_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO sensor_readings(device_id, salinity, ph, temperature, battery)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [device_id, salinity, ph, temperature, battery]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create reading" });
  }
}
