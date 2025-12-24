import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import { useDevices } from "../context/DevicesContext";
import { useMemo } from "react";
import { mergeDeviceComputed } from "../utils/status";
import { DeviceComputed } from "../types/device";
import DeviceTable from "../components/ui/DeviceTable";

export default function DevicesPage() {
  const { devices } = useDevices();

  // Demo computed values for table display
  const computedAll: Record<string, DeviceComputed | null> = useMemo(() => {
    const out: Record<string, DeviceComputed | null> = {};
    for (const d of devices) {
      const fake = {
        createdAt: new Date().toISOString(),
        salinity: d.id === "can-tho" ? 15.8 : d.id === "ca-mau" ? 6.2 : 3.1,
        ph: 7.4,
        temperature: 25.6,
        battery: d.id === "ca-mau" ? 52 : d.id === "soc-trang" ? 14 : 62
      };
      out[d.id] = mergeDeviceComputed(d, fake);
    }
    return out;
  }, [devices]);

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Devices"
        subtitle="Demo list of monitoring stations located in the Mekong Delta. Select one to view its dashboard."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {devices.map((d) => (
          <Card key={d.id} className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-extrabold text-brand-800">{d.name}</div>
                <div className="text-slate-600">{d.locationLabel}</div>
              </div>
              <Link
                to={`/device/${d.id}`}
                className="rounded-xl bg-brand-700 px-4 py-2 text-white font-semibold hover:bg-brand-800"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div><b>Lat:</b> {d.lat}</div>
              <div><b>Lng:</b> {d.lng}</div>
              <div><b>Channel:</b> {d.channelId}</div>
              <div><b>Battery low:</b> {d.thresholds.batteryLow}%</div>
            </div>
          </Card>
        ))}
      </div>

      {/* NEW: Table above footer like mock */}
      <DeviceTable devices={devices} computed={computedAll} />
    </div>
  );
}
