import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../components/ui/SectionTitle";
import DeviceDropdown from "../components/home/DeviceDropdown";
import AlertBar from "../components/home/AlertBar";
import VietnamMap from "../components/map/VietnamMap";
import MetricCard from "../components/ui/MetricCard";
import DeviceTitle from "../components/ui/DeviceTitle";
import { useDevices } from "../context/DevicesContext";
import { useDeviceData } from "../hooks/useDeviceData";
import { mergeDeviceComputed } from "../utils/status";
import { DeviceComputed } from "../types/device";
import StatsSummaryCards from "../components/home/StatsSummaryCards";
import DeviceTable from "../components/ui/DeviceTable";

export default function HomePage() {
  const { devices } = useDevices();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(devices[0]?.id || "");
  const selected = useMemo(
    () => devices.find((d) => d.id === selectedId) || null,
    [devices, selectedId]
  );

  const { latest } = useDeviceData(selected);

  useEffect(() => {
    if (!selectedId && devices[0]?.id) setSelectedId(devices[0].id);
  }, [devices.length]);

  const computedAll: Record<string, DeviceComputed | null> = useMemo(() => {
    const out: Record<string, DeviceComputed | null> = {};
    for (const d of devices) {
      const base = latest || {
        createdAt: new Date().toISOString(),
        salinity: 15.8,
        ph: 7.2,
        temperature: 28.5,
        battery: 15
      };

      // Demo values to create variety across devices
      const fake =
        d.id === "can-tho"
          ? { ...base, salinity: 15.8, battery: 55 } // high salinity -> red (by threshold)
          : d.id === "ca-mau"
          ? { ...base, salinity: 7.0, battery: 15 } // low battery -> yellow
          : d.id === "ben-tre"
          ? { ...base, salinity: 6.0, battery: 50, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() } // offline (handled later by backend, here still shows)
          : { ...base, salinity: 3.0, battery: 80 }; // active -> green

      out[d.id] = mergeDeviceComputed(d, d.id === selectedId ? base : fake);
    }
    return out;
  }, [devices, latest, selectedId]);

  // fixed 3 mock alerts
  const alerts = useMemo(() => {
    if (devices.length === 0) return [];

    const pick = (idx: number) => devices[Math.min(idx, devices.length - 1)];

    const redDevice = pick(0);
    const yellowDevice = pick(1);
    const grayDevice = pick(2);

    return [
      { deviceId: redDevice.id, deviceName: redDevice.name, status: "high_salinity" as const, message: "Salinity Levels High!" },
      { deviceId: yellowDevice.id, deviceName: yellowDevice.name, status: "low_battery" as const, message: "Battery Low!" },
      { deviceId: grayDevice.id, deviceName: grayDevice.name, status: "offline" as const, message: "Device Offline" }
    ];
  }, [devices]);

  const latestForSelected = computedAll[selectedId]?.latest;

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Welcome to the Water Monitoring System"
        subtitle="Monitor salinity, pH, temperature, and battery status of water quality sensors in the Mekong Delta."
      />

      {/* NEW: Summary cards like mock (desktop + mobile responsive) */}
      <StatsSummaryCards computedMap={computedAll} />

      <div className="space-y-4">
        {alerts.length ? (
          alerts.map((a) => (
            <AlertBar
              key={a.deviceId + a.status}
              deviceId={a.deviceId}
              deviceName={a.deviceName}
              message={a.message}
              status={a.status}
            />
          ))
        ) : (
          <div className="rounded-2xl bg-emerald-500/90 px-6 py-5 text-emerald-50 font-semibold">
            All devices are operating normally.
          </div>
        )}
      </div>

      <DeviceDropdown devices={devices} value={selectedId} onChange={setSelectedId} />

      <DeviceTitle name={selected?.name || "Select a device"} />

      <VietnamMap
        devices={devices}
        computed={computedAll}
        onSelect={(id) => {
          setSelectedId(id);
          navigate(`/device/${id}`);
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard icon="🌊" label="Salinity" value={(latestForSelected?.salinity ?? 15.8).toFixed(1)} unit="ppt" />
        <MetricCard icon="⚗️" label="pH Level" value={(latestForSelected?.ph ?? 7.2).toFixed(1)} />
        <MetricCard icon="🌡️" label="Temperature" value={(latestForSelected?.temperature ?? 28.5).toFixed(1)} unit="°C" />
        <MetricCard icon="🔋" label="Battery" value={String(Math.round(latestForSelected?.battery ?? 15))} unit="%" />
      </div>

      {/* NEW: Table above footer like mock */}
      <DeviceTable devices={devices} computed={computedAll} />

      <div className="text-center text-xs text-slate-500">
        Clicking an alert or map pin opens the device dashboard.
      </div>
    </div>
  );
}
