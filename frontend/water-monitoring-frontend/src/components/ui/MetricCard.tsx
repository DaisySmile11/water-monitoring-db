import Card from "./Card";

export default function MetricCard({
  icon,
  label,
  value,
  unit
}: {
  icon: string;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-center text-3xl">{icon}</div>

      <div className="mt-3 text-center font-bold text-brand-700">{label}</div>

      {/* separator line (mock-like) */}
      <div className="mx-auto mt-3 h-[2px] w-20 rounded-full bg-brand-200" />

      <div className="mt-4 text-center text-3xl font-extrabold text-brand-800">
        {value}
        {unit ? <span className="text-xl font-bold"> {unit}</span> : null}
      </div>
    </Card>
  );
}
