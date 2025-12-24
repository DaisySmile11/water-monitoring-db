import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import Card from "../ui/Card";
import { LatestReading } from "../../types/device";

function formatTime(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return s;
  }
}

function Chart({
  title,
  dataKey,
  unit,
  data
}: {
  title: string;
  dataKey: keyof LatestReading;
  unit: string;
  data: LatestReading[];
}) {
  return (
    <Card className="p-5">
      <div className="font-extrabold text-brand-800">{title}</div>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="createdAt" tickFormatter={formatTime} />
            <YAxis unit={unit} />
            <Tooltip
              labelFormatter={(v) => formatTime(String(v))}
              formatter={(v) => [`${v} ${unit}`, title]}
            />
            <Line type="monotone" dataKey={dataKey} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function DeviceCharts({ data }: { data: LatestReading[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
      <Chart title="Salinity" dataKey="salinity" unit="ppt" data={data} />
      <Chart title="pH Level" dataKey="ph" unit="" data={data} />
      <Chart title="Temperature" dataKey="temperature" unit="°C" data={data} />
      <Chart title="Battery" dataKey="battery" unit="%" data={data} />
    </div>
  );
}
