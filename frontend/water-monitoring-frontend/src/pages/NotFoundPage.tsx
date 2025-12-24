import { Link } from "react-router-dom";
import Card from "../components/ui/Card";

export default function NotFoundPage() {
  return (
    <Card className="p-10 text-center">
      <div className="text-3xl font-extrabold text-brand-800">404</div>
      <div className="mt-2 text-slate-600">Page not found.</div>
      <Link
        to="/"
        className="inline-block mt-6 rounded-xl bg-brand-700 px-5 py-2.5 text-white font-semibold hover:bg-brand-800"
      >
        Back to Home
      </Link>
    </Card>
  );
}
