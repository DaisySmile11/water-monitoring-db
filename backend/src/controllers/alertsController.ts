import { Request, Response } from "express";
import { pool } from "../db";
import { sendEmail } from "../email";

type EvaluatePayload = {
  device_id: string;
  createdAt?: string;
  salinity?: number;
  ph?: number;
  temperature?: number;
  battery?: number;
};

function isNumber(v: any): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

async function getSettings(deviceId: string) {
  const r = await pool.query(`SELECT * FROM alert_settings WHERE device_id = $1`, [deviceId]);
  return r.rows[0] || null;
}

export async function getAlertSettings(req: Request, res: Response) {
  try {
    const deviceId = req.params.deviceId;
    const s = await getSettings(deviceId);
    // If missing, return defaults (client can PUT to persist)
    if (!s) {
      return res.json({
        device_id: deviceId,
        salinity_high: 10,
        ph_low: 6.5,
        ph_high: 8.5,
        temperature_low: null,
        temperature_high: null,
        battery_low: 20,
        no_data_minutes: 60,
        cooldown_minutes: 15,
        email_to: "",
        enabled: true
      });
    }
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch alert settings" });
  }
}

export async function upsertAlertSettings(req: Request, res: Response) {
  try {
    const deviceId = req.params.deviceId;
    const {
      salinity_high,
      ph_low,
      ph_high,
      temperature_low,
      temperature_high,
      battery_low,
      no_data_minutes,
      cooldown_minutes,
      email_to,
      enabled
    } = req.body || {};

    const result = await pool.query(
      `INSERT INTO alert_settings(
          device_id, salinity_high, ph_low, ph_high, temperature_low, temperature_high,
          battery_low, no_data_minutes, cooldown_minutes, email_to, enabled, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
        ON CONFLICT (device_id) DO UPDATE SET
          salinity_high = EXCLUDED.salinity_high,
          ph_low = EXCLUDED.ph_low,
          ph_high = EXCLUDED.ph_high,
          temperature_low = EXCLUDED.temperature_low,
          temperature_high = EXCLUDED.temperature_high,
          battery_low = EXCLUDED.battery_low,
          no_data_minutes = EXCLUDED.no_data_minutes,
          cooldown_minutes = EXCLUDED.cooldown_minutes,
          email_to = EXCLUDED.email_to,
          enabled = EXCLUDED.enabled,
          updated_at = NOW()
        RETURNING *`,
      [
        deviceId,
        salinity_high ?? null,
        ph_low ?? null,
        ph_high ?? null,
        temperature_low ?? null,
        temperature_high ?? null,
        battery_low ?? null,
        no_data_minutes ?? 60,
        cooldown_minutes ?? 15,
        email_to ?? "",
        enabled ?? true
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update alert settings" });
  }
}

export async function getAlerts(req: Request, res: Response) {
  try {
    const { device_id, limit } = req.query;
    const lim = Math.min(Number(limit || 50), 200);

    if (device_id) {
      const r = await pool.query(
        `SELECT * FROM alerts WHERE device_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [String(device_id), lim]
      );
      return res.json(r.rows);
    }

    const r = await pool.query(`SELECT * FROM alerts ORDER BY created_at DESC LIMIT $1`, [lim]);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
}

async function shouldCooldown(deviceId: string, type: string, cooldownMinutes: number) {
  const r = await pool.query(
    `SELECT created_at FROM alerts WHERE device_id = $1 AND type = $2 ORDER BY created_at DESC LIMIT 1`,
    [deviceId, type]
  );
  const last = r.rows[0]?.created_at ? new Date(r.rows[0].created_at) : null;
  if (!last) return false;
  const diffMs = Date.now() - last.getTime();
  return diffMs < cooldownMinutes * 60 * 1000;
}

async function createAlert(params: {
  device_id: string;
  type: string;
  severity: "warning" | "critical";
  message: string;
  value?: number;
  threshold?: number;
  email_to?: string;
}) {
  const r = await pool.query(
    `INSERT INTO alerts(device_id, type, severity, message, value, threshold, email_to)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      params.device_id,
      params.type,
      params.severity,
      params.message,
      params.value ?? null,
      params.threshold ?? null,
      params.email_to ?? null
    ]
  );
  return r.rows[0];
}

export async function evaluateReading(req: Request, res: Response) {
  try {
    const body = (req.body || {}) as EvaluatePayload;
    const deviceId = String(body.device_id || "").trim();

    if (!deviceId) {
      return res.status(400).json({ error: "device_id is required" });
    }

    const s = await getSettings(deviceId);
    const settings = s || {
      device_id: deviceId,
      salinity_high: 10,
      ph_low: 6.5,
      ph_high: 8.5,
      temperature_low: null,
      temperature_high: null,
      battery_low: 20,
      no_data_minutes: 60,
      cooldown_minutes: 15,
      email_to: "",
      enabled: true
    };

    if (!settings.enabled) {
      return res.json({ ok: true, created: [], settings });
    }

    const created: any[] = [];
    const emailTo = (settings.email_to || "").trim();
    const cooldown = Number(settings.cooldown_minutes || 15);

    // No-data / stale data (if createdAt is too old)
    if (body.createdAt) {
      const last = new Date(body.createdAt);
      if (!isNaN(last.getTime())) {
        const noDataMinutes = Number(settings.no_data_minutes || 60);
        const diffMs = Date.now() - last.getTime();
        if (diffMs > noDataMinutes * 60 * 1000) {
          const type = "no_data";
          if (!(await shouldCooldown(deviceId, type, cooldown))) {
            const mins = Math.floor(diffMs / 60000);
            const alert = await createAlert({
              device_id: deviceId,
              type,
              severity: "critical",
              message: `No new data received for ${mins} minutes (threshold: ${noDataMinutes} minutes)`,
              value: mins,
              threshold: noDataMinutes,
              email_to: emailTo
            });
            created.push(alert);
          }
        }
      }
    }

    // Evaluate thresholds
    // Salinity high
    if (isNumber(body.salinity) && isNumber(settings.salinity_high) && body.salinity > settings.salinity_high) {
      const type = "salinity_high";
      if (!(await shouldCooldown(deviceId, type, cooldown))) {
        const alert = await createAlert({
          device_id: deviceId,
          type,
          severity: "warning",
          message: `Salinity is high: ${body.salinity} ppt (threshold: ${settings.salinity_high} ppt)` ,
          value: body.salinity,
          threshold: settings.salinity_high,
          email_to: emailTo
        });
        created.push(alert);
      }
    }

    // pH out of range
    if (isNumber(body.ph)) {
      if (isNumber(settings.ph_low) && body.ph < settings.ph_low) {
        const type = "ph_low";
        if (!(await shouldCooldown(deviceId, type, cooldown))) {
          const alert = await createAlert({
            device_id: deviceId,
            type,
            severity: "warning",
            message: `pH is low: ${body.ph} (threshold: ${settings.ph_low})`,
            value: body.ph,
            threshold: settings.ph_low,
            email_to: emailTo
          });
          created.push(alert);
        }
      }
      if (isNumber(settings.ph_high) && body.ph > settings.ph_high) {
        const type = "ph_high";
        if (!(await shouldCooldown(deviceId, type, cooldown))) {
          const alert = await createAlert({
            device_id: deviceId,
            type,
            severity: "warning",
            message: `pH is high: ${body.ph} (threshold: ${settings.ph_high})`,
            value: body.ph,
            threshold: settings.ph_high,
            email_to: emailTo
          });
          created.push(alert);
        }
      }
    }

    // Temperature out of range (optional)
    if (isNumber(body.temperature)) {
      if (isNumber(settings.temperature_low) && body.temperature < settings.temperature_low) {
        const type = "temperature_low";
        if (!(await shouldCooldown(deviceId, type, cooldown))) {
          const alert = await createAlert({
            device_id: deviceId,
            type,
            severity: "warning",
            message: `Temperature is low: ${body.temperature}°C (threshold: ${settings.temperature_low}°C)`,
            value: body.temperature,
            threshold: settings.temperature_low,
            email_to: emailTo
          });
          created.push(alert);
        }
      }
      if (isNumber(settings.temperature_high) && body.temperature > settings.temperature_high) {
        const type = "temperature_high";
        if (!(await shouldCooldown(deviceId, type, cooldown))) {
          const alert = await createAlert({
            device_id: deviceId,
            type,
            severity: "warning",
            message: `Temperature is high: ${body.temperature}°C (threshold: ${settings.temperature_high}°C)`,
            value: body.temperature,
            threshold: settings.temperature_high,
            email_to: emailTo
          });
          created.push(alert);
        }
      }
    }

    // Battery low
    if (isNumber(body.battery) && isNumber(settings.battery_low) && body.battery < settings.battery_low) {
      const type = "battery_low";
      if (!(await shouldCooldown(deviceId, type, cooldown))) {
        const alert = await createAlert({
          device_id: deviceId,
          type,
          severity: body.battery < 10 ? "critical" : "warning",
          message: `Battery is low: ${body.battery}% (threshold: ${settings.battery_low}%)`,
          value: body.battery,
          threshold: settings.battery_low,
          email_to: emailTo
        });
        created.push(alert);
      }
    }

    // Send email (best-effort) for newly created alerts
    if (created.length && emailTo) {
      const subject = `[Water Monitoring] ${deviceId}: ${created.length} alert(s)`;
      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6">
          <h2>Water Monitoring Alert</h2>
          <p><b>Device:</b> ${deviceId}</p>
          <ul>
            ${created
              .map((a) => `<li><b>${a.type}</b> — ${a.message} <i>(${new Date(a.created_at).toLocaleString()})</i></li>`)
              .join("")}
          </ul>
          <p>Cooldown: ${cooldown} minutes (duplicate alerts are suppressed).</p>
        </div>
      `;

      const ok = await sendEmail({ to: emailTo, subject, html });
      if (ok) {
        await pool.query(`UPDATE alerts SET email_sent = TRUE WHERE id = ANY($1::bigint[])`, [created.map((a) => a.id)]);
      }
    }

    res.json({ ok: true, created, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate reading" });
  }
}
