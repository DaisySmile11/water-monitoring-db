import axios from "axios";

export type AlertSettings = {
  device_id: string;
  salinity_high: number | null;
  ph_low: number | null;
  ph_high: number | null;
  temperature_low: number | null;
  temperature_high: number | null;
  battery_low: number | null;
  no_data_minutes: number;
  cooldown_minutes: number;
  email_to: string; // comma-separated emails
  enabled: boolean;
};

export type AlertRow = {
  id: number;
  device_id: string;
  type: string;
  severity: string;
  message: string;
  value: number | null;
  threshold: number | null;
  created_at: string;
  email_sent: boolean;
  email_to: string | null;
};

// Same-origin API (works on Render single-service deployment)
const api = axios.create({ baseURL: "/" });

export async function fetchAlertSettings(deviceId: string) {
  const { data } = await api.get<AlertSettings>(`/api/alerts/settings/${deviceId}`);
  return data;
}

export async function saveAlertSettings(deviceId: string, payload: Partial<AlertSettings>) {
  const { data } = await api.put<AlertSettings>(`/api/alerts/settings/${deviceId}`, payload);
  return data;
}

export async function fetchAlerts(deviceId?: string, limit = 50) {
  const { data } = await api.get<AlertRow[]>(`/api/alerts`, {
    params: { device_id: deviceId, limit }
  });
  return data;
}

export async function evaluateReading(payload: {
  device_id: string;
  createdAt?: string;
  salinity?: number;
  ph?: number;
  temperature?: number;
  battery?: number;
}) {
  const { data } = await api.post(`/api/alerts/evaluate`, payload);
  return data;
}
