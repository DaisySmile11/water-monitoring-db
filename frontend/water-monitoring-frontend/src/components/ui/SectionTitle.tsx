export default function SectionTitle({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-800 tracking-tight drop-shadow-sm">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-slate-600 max-w-3xl mx-auto">{subtitle}</p>
      ) : null}
    </div>
  );
}
