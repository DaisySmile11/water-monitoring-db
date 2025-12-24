import { Link } from "react-router-dom";
import Card from "./Card";
import { Device, DeviceComputed, DeviceStatus } from "../../types/device";

function badge(status: DeviceStatus) {
  const cls =
    status === "active"
      ? "bg-amber-100 text-amber-900"
      : status === "high_salinity"
      ? "bg-red-500 text-white"
      : status === "low_battery"
      ? "bg-amber-200 text-amber-950"
      : "bg-slate-200 text-slate-700";

  const label =
    status === "active"
      ? "Active"
      : status === "high_salinity"
      ? "Salinity High"
      : status === "low_battery"
      ? "Low Battery"
      : "Offline";

  return <span className={"inline-flex items-center rounded-lg px-3 py-1 text-xs font-extrabold " + cls}>{label}</span>;
}

export default function DeviceTable({
  devices,
  computed
}: {
  devices: Device[];
  computed: Record<string, DeviceComputed | null>;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b bg-white">
        <div className="font-extrabold text-brand-800">All Stations Data</div>
        <div className="text-xs text-slate-500 mt-1">Quick overview of all devices (demo table like mock).</div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left font-bold px-5 py-3">Name</th>
              <th className="text-left font-bold px-5 py-3">Location</th>
              <th className="text-left font-bold px-5 py-3">Status</th>
              <th className="text-left font-bold px-5 py-3">Salinity</th>
              <th className="text-left font-bold px-5 py-3">pH</th>
              <th className="text-left font-bold px-5 py-3">T(°C)</th>
              <th className="text-left font-bold px-5 py-3">Battery</th>
              <th className="text-left font-bold px-5 py-3">Last seen</th>
              <th className="text-left font-bold px-5 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {devices.map((d) => {
              const c = computed[d.id];
              const status = c?.status || "offline";
              const latest = c?.latest;

              return (
                <tr key={d.id} className="border-t hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-extrabold text-slate-800">{d.name}</td>
                  <td className="px-5 py-4 text-slate-600">{d.locationLabel}</td>
                  <td className="px-5 py-4">{badge(status)}</td>
                  <td className="px-5 py-4">{latest ? `${latest.salinity.toFixed(1)} ppt` : "—"}</td>
                  <td className="px-5 py-4">{latest ? latest.ph.toFixed(1) : "—"}</td>
                  <td className="px-5 py-4">{latest ? latest.temperature.toFixed(1) : "—"}</td>
                  <td className="px-5 py-4">{latest ? `${Math.round(latest.battery)}%` : "—"}</td>
                  <td className="px-5 py-4">{latest ? new Date(latest.createdAt).toLocaleString() : "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/device/${d.id}`} className="font-extrabold text-brand-700 hover:text-brand-800">
                      →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
