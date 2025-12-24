export default function DeviceTitle({ name }: { name: string }) {
  return (
    <div className="my-6 text-center">
      <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-700 tracking-tight drop-shadow-sm">
  {name}
</h2>
    </div>
  );
}
