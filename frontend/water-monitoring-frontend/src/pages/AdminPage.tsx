import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import { useDevices } from "../context/DevicesContext";
import { Device } from "../types/device";
import { fetchAlertSettings, saveAlertSettings, AlertSettings } from "../services/backend";

export default function AdminPage() {
  const { devices, addDevice, removeDevice } = useDevices();

  // --- Alert Settings ---
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || "");
  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [settingsStatus, setSettingsStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("idle");

  const [form, setForm] = useState({
    id: "",
    name: "",
    locationLabel: "",
    lat: "",
    lng: "",
    channelId: "",
    apiKeyRead: "",
    salinityHigh: "10",
    batteryLow: "20"
  });

  const canSubmit = useMemo(() => {
    return (
      form.id.trim() &&
      form.name.trim() &&
      form.lat.trim() &&
      form.lng.trim() &&
      form.channelId.trim()
    );
  }, [form]);

  const onChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!selectedDeviceId) return;
    setSettingsStatus("loading");
    fetchAlertSettings(selectedDeviceId)
      .then((s) => {
        setSettings(s);
        setSettingsStatus("idle");
      })
      .catch(() => setSettingsStatus("error"));
  }, [selectedDeviceId]);

  // Keep selected device stable if list changes
  useEffect(() => {
    if (!selectedDeviceId && devices[0]?.id) setSelectedDeviceId(devices[0].id);
  }, [devices.length]);


  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const d: Device = {
      id: form.id.trim(),
      name: form.name.trim(),
      locationLabel: form.locationLabel.trim() || form.name.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      channelId: Number(form.channelId),
      apiKeyRead: form.apiKeyRead.trim(),
      thresholds: {
        salinityHigh: Number(form.salinityHigh),
        batteryLow: Number(form.batteryLow)
      }
    };

    addDevice(d);

    // Auto-select new device for alert settings
    setSelectedDeviceId(d.id);

    setForm({
      id: "",
      name: "",
      locationLabel: "",
      lat: "",
      lng: "",
      channelId: "",
      apiKeyRead: "",
      salinityHigh: "10",
      batteryLow: "20"
    });
  };

  return (
    <div className="space-y-8">
      <SectionTitle title="Admin Panel" subtitle="Add / remove monitoring stations (demo storage via LocalStorage)." />

      <Card className="p-6">
        <div className="text-lg font-extrabold text-brand-800">Add New Device</div>

        <form onSubmit={onAdd} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">Device ID (unique)</label>
            <input value={form.id} onChange={(e) => onChange("id", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="vd: long-an-station" />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">Name</label>
            <input value={form.name} onChange={(e) => onChange("name", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Long An Station" />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">Location Label</label>
            <input value={form.locationLabel} onChange={(e) => onChange("locationLabel", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Long An" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-600">Latitude</label>
              <input value={form.lat} onChange={(e) => onChange("lat", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="10.123" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Longitude</label>
              <input value={form.lng} onChange={(e) => onChange("lng", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="106.123" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">ThingSpeak Channel ID</label>
            <input value={form.channelId} onChange={(e) => onChange("channelId", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="2690349" />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">Read API Key</label>
            <input value={form.apiKeyRead} onChange={(e) => onChange("apiKeyRead", e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="FTD33..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-600">Salinity High (ppt)</label>
              <input value={form.salinityHigh} onChange={(e) => onChange("salinityHigh", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="10" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Battery Low (%)</label>
              <input value={form.batteryLow} onChange={(e) => onChange("batteryLow", e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="20" />
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              disabled={!canSubmit}
              className="w-full rounded-xl bg-brand-700 py-3 text-white font-extrabold hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Device
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-brand-800">Alert Settings & Email Notifications</div>
        <div className="mt-2 text-sm text-slate-600">
          Configure threshold-based alerts. When new readings are fetched, the frontend calls the backend to evaluate rules, store alerts, and optionally send emails.
        </div>

        {devices.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">Add at least 1 device first.</div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600">Select Device</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600">Email recipients</label>
                <input
                  value={settings?.email_to || ""}
                  onChange={(e) => setSettings((s) => (s ? { ...s, email_to: e.target.value } : s))}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  placeholder="vd: daisy@gmail.com, ops@company.com"
                />
                <div className="mt-1 text-xs text-slate-500">Comma-separated emails. (SMTP must be configured in backend env.)</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Cooldown (minutes)</label>
                  <input
                    value={String(settings?.cooldown_minutes ?? 15)}
                    onChange={(e) => setSettings((s) => (s ? { ...s, cooldown_minutes: Number(e.target.value || 0) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">No data (minutes)</label>
                  <input
                    value={String(settings?.no_data_minutes ?? 60)}
                    onChange={(e) => setSettings((s) => (s ? { ...s, no_data_minutes: Number(e.target.value || 0) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="60"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Salinity high (ppt)</label>
                  <input
                    value={String(settings?.salinity_high ?? "")}
                    onChange={(e) => setSettings((s) => (s ? { ...s, salinity_high: e.target.value === "" ? null : Number(e.target.value) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Battery low (%)</label>
                  <input
                    value={String(settings?.battery_low ?? "")}
                    onChange={(e) => setSettings((s) => (s ? { ...s, battery_low: e.target.value === "" ? null : Number(e.target.value) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-600">pH low</label>
                  <input
                    value={String(settings?.ph_low ?? "")}
                    onChange={(e) => setSettings((s) => (s ? { ...s, ph_low: e.target.value === "" ? null : Number(e.target.value) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="6.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">pH high</label>
                  <input
                    value={String(settings?.ph_high ?? "")}
                    onChange={(e) => setSettings((s) => (s ? { ...s, ph_high: e.target.value === "" ? null : Number(e.target.value) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder="8.5"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="grid grid-cols-2 gap-3 md:col-span-2">
                <div>
                  <label className="text-sm font-semibold text-slate-600">Temp low (°C) (optional)</label>
                  <input
                    value={String(settings?.temperature_low ?? "")}
                    onChange={(e) => setSettings((s) => (s ? { ...s, temperature_low: e.target.value === "" ? null : Number(e.target.value) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder=""
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">Temp high (°C) (optional)</label>
                  <input
                    value={String(settings?.temperature_high ?? "")}
                    onChange={(e) => setSettings((s) => (s ? { ...s, temperature_high: e.target.value === "" ? null : Number(e.target.value) } : s))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(settings?.enabled)}
                  onChange={(e) => setSettings((s) => (s ? { ...s, enabled: e.target.checked } : s))}
                  className="h-5 w-5"
                />
                <div className="text-sm font-semibold text-slate-700">Enable alerts</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={async () => {
                  if (!settings) return;
                  setSettingsStatus("saving");
                  try {
                    const saved = await saveAlertSettings(selectedDeviceId, settings);
                    setSettings(saved);
                    setSettingsStatus("saved");
                    setTimeout(() => setSettingsStatus("idle"), 1200);
                  } catch {
                    setSettingsStatus("error");
                  }
                }}
                className="rounded-xl bg-brand-700 px-5 py-3 text-white font-extrabold hover:bg-brand-800"
              >
                Save Settings
              </button>

              {settingsStatus === "loading" && <div className="text-sm text-slate-500">Loading settings…</div>}
              {settingsStatus === "saving" && <div className="text-sm text-slate-500">Saving…</div>}
              {settingsStatus === "saved" && <div className="text-sm text-green-700 font-semibold">Saved ✓</div>}
              {settingsStatus === "error" && <div className="text-sm text-red-700 font-semibold">Error (check backend / DB)</div>}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="text-lg font-extrabold text-brand-800">Existing Devices</div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-semibold text-brand-800">{d.name}</td>
                  <td className="py-3 pr-4">{d.id}</td>
                  <td className="py-3 pr-4">{d.locationLabel}</td>
                  <td className="py-3 pr-4">{d.channelId}</td>
                  <td className="py-3 pr-0">
                    <button
                      onClick={() => removeDevice(d.id)}
                      className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Removal only affects LocalStorage (demo). Hook this to backend later.
        </div>
      </Card>

    </div>
  );
}
