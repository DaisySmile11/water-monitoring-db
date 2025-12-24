import Card from "../ui/Card";
import { LatestReading } from "../../types/device";

export default function DeviceReadingsTable({
  data
}: {
  data: LatestReading[];
}) {
  const rows = [...data].reverse().slice(0, 20);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b bg-white">
        <div className="font-extrabold text-brand-800">Recent Readings</div>
        <div className="text-xs text-slate-500 mt-1">
          Latest 20 records from this device (demo).
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left font-bold px-5 py-3">Time</th>
              <th className="text-left font-bold px-5 py-3">Salinity (ppt)</th>
              <th className="text-left font-bold px-5 py-3">pH</th>
              <th className="text-left font-bold px-5 py-3">Temp (°C)</th>
              <th className="text-left font-bold px-5 py-3">Battery (%)</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.createdAt + idx} className="border-t hover:bg-slate-50/60">
                <td className="px-5 py-4">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-5 py-4">{r.salinity.toFixed(1)}</td>
                <td className="px-5 py-4">{r.ph.toFixed(1)}</td>
                <td className="px-5 py-4">{r.temperature.toFixed(1)}</td>
                <td className="px-5 py-4">{Math.round(r.battery)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
