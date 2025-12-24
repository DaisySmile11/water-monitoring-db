import { Link } from "react-router-dom";
import { DeviceStatus } from "../../types/device";
import { statusColor, statusLabel } from "../../utils/status";

export default function AlertBar({
  deviceId,
  deviceName,
  message,
  status
}: {
  deviceId: string;
  deviceName: string;
  message: string;
  status: Exclude<DeviceStatus, "active">;
}) {
  const c = statusColor(status);
  const title = statusLabel(status);

  return (
    <Link to={`/device/${deviceId}`} className="block">
      <div
        className={
          "rounded-2xl px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-3 shadow-soft transition hover:brightness-[1.02] " +
          c.bar
        }
      >
        <div
          className={
            "h-9 w-9 rounded-xl bg-white/30 flex items-center justify-center " +
            c.text
          }
        >
          <span className="text-lg">⚠️</span>
        </div>

        <div className={"flex-1 " + c.text}>
          <div className="text-sm sm:text-base font-semibold">
            <span className="font-extrabold">{title}:</span>{" "}
            <span className="font-extrabold underline underline-offset-2">
              {deviceName}
            </span>{" "}
            – {message}
          </div>
        </div>

        <div className={"text-xl font-extrabold " + c.text}>›</div>
      </div>
    </Link>
  );
}
