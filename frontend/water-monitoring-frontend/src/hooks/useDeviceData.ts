import { useEffect, useMemo, useState } from "react";
import { Device, LatestReading } from "../types/device";
import { fetchLatestReading, fetchRecentReadings } from "../services/thingspeak";

export function useDeviceData(device: Device | null) {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [series, setSeries] = useState<LatestReading[]>([]);
  const [loading, setLoading] = useState(false);

  const pollInterval =
    Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 15000;

  useEffect(() => {
    if (!device) return;

    let alive = true;

    const run = async () => {
      setLoading(true);
      try {
        const api = device.apiKeyRead || "";
        const l = await fetchLatestReading(device.channelId, api, 1);
        const s = await fetchRecentReadings(device.channelId, api, 25);

        if (!alive) return;
        if (l) setLatest(l);
        setSeries(s);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();

    const t = setInterval(run, pollInterval);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [device?.id]);

  const lastUpdated = useMemo(() => latest?.createdAt || null, [latest]);

  return { latest, series, loading, lastUpdated };
}
