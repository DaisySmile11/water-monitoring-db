import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import SectionTitle from "../components/ui/SectionTitle";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const ok = login(username.trim(), password);
    if (!ok) {
      setError("Invalid credentials. Please try again.");
      return;
    }
    navigate("/admin");
  };

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Admin Login"
        subtitle="Only admins can add / remove monitoring devices."
      />

      <Card className="max-w-lg mx-auto p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Enter password"
            />
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button className="w-full rounded-xl bg-brand-700 py-3 text-white font-extrabold hover:bg-brand-800">
            Login
          </button>
        </form>
      </Card>
    </div>
  );
}
