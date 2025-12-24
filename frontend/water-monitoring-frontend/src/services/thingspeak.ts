import axios from "axios";
import { LatestReading } from "../types/device";

type FeedResponse = {
  feeds: Array<{
    created_at: string;
    field1?: string; // salinity
    field2?: string; // ph
    field3?: string; // temp
    field4?: string; // battery
  }>;
};

const BASE = "https://api.thingspeak.com";

function parseNumber(v: string | undefined, fallback: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function fetchLatestReading(channelId: number, apiKeyRead: string, results = 1) {
  const url = `${BASE}/channels/${channelId}/feeds.json`;
  const { data } = await axios.get<FeedResponse>(url, {
    params: { api_key: apiKeyRead, results }
  });

  const last = data.feeds?.[data.feeds.length - 1];
  if (!last) return null;

  const reading: LatestReading = {
    createdAt: last.created_at,
    salinity: parseNumber(last.field1, 15.8),
    ph: parseNumber(last.field2, 7.2),
    temperature: parseNumber(last.field3, 28.5),
    battery: parseNumber(last.field4, 15)
  };

  return reading;
}

export async function fetchRecentReadings(channelId: number, apiKeyRead: string, results = 20) {
  const url = `${BASE}/channels/${channelId}/feeds.json`;
  const { data } = await axios.get<FeedResponse>(url, {
    params: { api_key: apiKeyRead, results }
  });

  return (data.feeds || [])
    .filter(Boolean)
    .map((f) => ({
      createdAt: f.created_at,
      salinity: parseNumber(f.field1, 0),
      ph: parseNumber(f.field2, 0),
      temperature: parseNumber(f.field3, 0),
      battery: parseNumber(f.field4, 0)
    }));
}
