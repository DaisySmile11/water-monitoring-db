import { Device } from "../../types/device";

export default function DeviceDropdown({
  devices,
  value,
  onChange
}: {
  devices: Device[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <span className="text-slate-600 font-semibold">Select Device:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-56 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-brand-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
