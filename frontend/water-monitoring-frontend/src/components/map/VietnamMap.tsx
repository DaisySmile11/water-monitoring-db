import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Device, DeviceComputed, DeviceStatus } from "../../types/device";
import { statusColor } from "../../utils/status";

/**
 * Pin-style marker with center circle (mock-like).
 * IMPORTANT: color is mapped by status:
 * - red: high_salinity
 * - yellow: low_battery
 * - green: active
 * - gray: offline
 */
const pinIconByStatus = (status: DeviceStatus) => {
  const color =
    status === "high_salinity"
      ? "#ef4444" // red
      : status === "low_battery"
      ? "#f59e0b" // yellow/amber
      : status === "active"
      ? "#10b981" // green
      : "#94a3b8"; // gray (offline)

  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    html: `
      <div style="position:relative; width:36px; height:36px;">
        <svg width="36" height="36" viewBox="0 0 48 48" style="filter: drop-shadow(0 10px 18px rgba(0,0,0,.25));">
          <path d="M24 2C14.6 2 7 9.6 7 19c0 12.3 17 27 17 27s17-14.7 17-27C41 9.6 33.4 2 24 2z" fill="${color}" stroke="white" stroke-width="3"/>
          <circle cx="24" cy="19" r="7" fill="white" opacity="0.9"/>
        </svg>
      </div>
    `
  });
};

export default function VietnamMap({
  devices,
  computed,
  onSelect
}: {
  devices: Device[];
  computed: Record<string, DeviceComputed | null>;
  onSelect: (deviceId: string) => void;
}) {
  return (
    <div className="h-[320px] sm:h-[420px] w-full rounded-3xl overflow-hidden shadow-soft border border-slate-100 bg-white relative">
      <div className="absolute inset-0 bg-brand-50/40 pointer-events-none z-[400]" />

      <MapContainer
        center={[9.8, 105.3]}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {devices.map((d) => {
          const c = computed[d.id];
          const status: DeviceStatus = c?.status || "offline";

          return (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={pinIconByStatus(status)}
              eventHandlers={{
                click: () => onSelect(d.id),
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup()
              }}
            >
              <Popup closeButton={false} autoPan={false}>
                <div className="min-w-[240px] rounded-xl border border-slate-200 bg-white shadow-soft">
                  <div className="px-4 pt-3 pb-2 font-extrabold text-brand-800 text-base">
                    {d.name}
                  </div>

                  <div className="px-4 pb-4 text-sm leading-6 text-slate-700">
                    <div>
                      <span className="font-bold">Salinity:</span>{" "}
                      {c?.latest.salinity ?? "-"} ppt
                    </div>
                    <div>
                      <span className="font-bold">pH:</span> {c?.latest.ph ?? "-"}
                    </div>
                    <div>
                      <span className="font-bold">Temperature:</span>{" "}
                      {c?.latest.temperature ?? "-"}°C
                    </div>
                    <div>
                      <span className="font-bold">Battery:</span>{" "}
                      {c?.latest.battery ?? "-"}%
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      Status: <b>{status.replace("_", " ")}</b>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
