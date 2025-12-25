import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDevices } from "../context/DevicesContext";
import DeviceTitle from "../components/ui/DeviceTitle";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import DeviceCharts from "../components/charts/DeviceCharts";
import { useDeviceData } from "../hooks/useDeviceData";
import { computeStatus, statusColor, statusLabel } from "../utils/status";
import DeviceReadingsTable from "../components/device/DeviceReadingsTable";
import { fetchAlerts, AlertRow } from "../services/backend";

export default function DeviceDashboardPage() {
  const { deviceId } = useParams();
  const { devices } = useDevices();
  const device = useMemo(() => devices.find((d) => d.id === deviceId) || null, [devices, deviceId]);

  const { latest, series, loading, lastUpdated } = useDeviceData(device);

  // Recent alerts (from backend)
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  useEffect(() => {
    if (!device) return;
    fetchAlerts(device.id, 20)
      .then(setAlerts)
      .catch(() => setAlerts([]));
  }, [device?.id, latest?.createdAt]);

  if (!device) {
    return (
      <Card className="p-8 text-center">
        <div className="text-xl font-extrabold text-brand-800">Device not found</div>
      </Card>
    );
  }

  const latestSafe = latest || {
    createdAt: new Date().toISOString(),
    salinity: 15.8,
    ph: 7.2,
    temperature: 28.5,
    battery: 15
  };

  const status = computeStatus(device, latestSafe);
  const s = statusColor(status);

  return (
    <div className="space-y-6">
      <DeviceTitle name={device.name} />

      <div className={"rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 " + s.bar}>
        <div className={"font-extrabold " + s.text}>{statusLabel(status)}</div>
        <div className={"text-sm " + s.text}>
          Last updated: <b>{lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}</b>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon="🌊" label="Salinity" value={latestSafe.salinity.toFixed(1)} unit="ppt" />
        <MetricCard icon="⚗️" label="pH Level" value={latestSafe.ph.toFixed(1)} />
        <MetricCard icon="🌡️" label="Temperature" value={latestSafe.temperature.toFixed(1)} unit="°C" />
        <MetricCard icon="🔋" label="Battery" value={String(Math.round(latestSafe.battery))} unit="%" />
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-600">
        {loading ? (
          <>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            Fetching latest readings...
          </>
        ) : (
          <>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Live data ready
          </>
        )}
      </div>

      <DeviceCharts data={series.length ? series : [latestSafe]} />

      {/* NEW: Table of device readings */}
      <DeviceReadingsTable data={series.length ? series : [latestSafe]} />

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="font-extrabold text-brand-800">Recent Alerts</div>
          <div className="text-xs text-slate-500">Stored in backend</div>
        </div>

        {alerts.length === 0 ? (
          <div className="mt-3 text-sm text-slate-500">No alerts yet (or backend DB not configured).</div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 border-b">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Severity</th>
                  <th className="py-2 pr-4">Message</th>
                  <th className="py-2 pr-0">Email</th>
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 10).map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-brand-800">{a.type}</td>
                    <td className="py-3 pr-4">{a.severity}</td>
                    <td className="py-3 pr-4">{a.message}</td>
                    <td className="py-3 pr-0 whitespace-nowrap">
                      {a.email_to ? (a.email_sent ? "sent" : "pending") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="font-extrabold text-brand-800">Device Info</div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><b>Device ID:</b> {device.id}</div>
          <div><b>Location:</b> {device.locationLabel}</div>
          <div><b>Channel ID:</b> {device.channelId}</div>
          <div><b>Threshold (Salinity High):</b> {device.thresholds.salinityHigh} ppt</div>
          <div><b>Threshold (Battery Low):</b> {device.thresholds.batteryLow}%</div>
        </div>
      </Card>
    </div>
  );
}
