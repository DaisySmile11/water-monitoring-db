import { Outlet } from "react-router-dom";
import Navbar from "../nav/Navbar";
import { DevicesProvider } from "../../context/DevicesContext";

export default function AppLayout() {
  return (
    <DevicesProvider>
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <Outlet />
        </main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
            Water Monitoring • Senior Thesis • Full-stack Web Application for Battery-Powered WSN
          </div>
        </footer>
      </div>
    </DevicesProvider>
  );
}
