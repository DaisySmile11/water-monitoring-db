import Card from "../ui/Card";
import { DeviceComputed, DeviceStatus } from "../../types/device";

function smallDot(status: DeviceStatus) {
  const c =
    status === "high_salinity"
      ? "bg-red-500"
      : status === "low_battery"
      ? "bg-amber-500"
      : status === "active"
      ? "bg-emerald-500"
      : "bg-slate-400";
  return <span className={"inline-block h-2.5 w-2.5 rounded-full " + c} />;
}

export default function StatsSummaryCards({
  computedMap
}: {
  computedMap: Record<string, DeviceComputed | null>;
}) {
  const devices = Object.values(computedMap).filter(Boolean) as DeviceComputed[];
  const total = Object.keys(computedMap).length;

  const activeCount = devices.filter((d) => d.status === "active").length;
  const alertCount = devices.filter((d) => d.status === "high_salinity" || d.status === "low_battery").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;

  const topStatus: DeviceStatus =
    offlineCount > 0 ? "offline" : alertCount > 0 ? "low_battery" : "active";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-brand-100 flex items-center justify-center text-xl">🔗</div>
          <div className="text-slate-600 text-sm font-semibold">Total Devices</div>
        </div>
        <div className="mt-3 text-3xl font-extrabold text-brand-800">{total}</div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">✅</div>
          <div className="text-slate-600 text-sm font-semibold">Active Devices</div>
        </div>
        <div className="mt-3 text-3xl font-extrabold text-brand-800">{activeCount}</div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">🔥</div>
          <div className="text-slate-600 text-sm font-semibold">Alerts Today</div>
        </div>
        <div className="mt-3 text-3xl font-extrabold text-brand-800">{alertCount}</div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
            {smallDot("active")}
            <span className="mx-1" />
            {smallDot("low_battery")}
            <span className="mx-1" />
            {smallDot("offline")}
          </div>
          <div className="text-slate-600 text-sm font-semibold">Network</div>
        </div>
        <div className="mt-3 text-2xl font-extrabold text-brand-800 capitalize">
          {topStatus.replace("_", " ")}
        </div>
      </Card>
    </div>
  );
}
