import { Device, DeviceComputed, DeviceStatus, LatestReading } from "../types/device";

/**
 * Status rules (simple + readable):
 * - offline: no latest reading (or backend can mark offline)
 * - low_battery: battery <= threshold
 * - high_salinity: salinity >= threshold
 * - active: normal
 */
export function computeStatus(device: Device, latest: LatestReading): DeviceStatus {
  if (!latest) return "offline";
  if (latest.battery <= device.thresholds.batteryLow) return "low_battery";
  if (latest.salinity >= device.thresholds.salinityHigh) return "high_salinity";
  return "active";
}

/**
 * Color mapping tuned to match the approved mock UI:
 * - Alerts: slightly pastel + soft shadow ready
 * - Active: green
 * - Offline: gray
 */
export function statusColor(status: DeviceStatus) {
  switch (status) {
    case "high_salinity":
      return {
        dot: "bg-red-500",
        bar: "bg-red-500/90 border border-red-200",
        text: "text-white"
      };
    case "low_battery":
      return {
        dot: "bg-amber-500",
        bar: "bg-amber-300 border border-amber-200",
        text: "text-amber-950"
      };
    case "offline":
      return {
        dot: "bg-slate-400",
        bar: "bg-slate-200 border border-slate-300",
        text: "text-slate-700"
      };
    default:
      return {
        dot: "bg-emerald-500",
        bar: "bg-emerald-500 border border-emerald-200",
        text: "text-white"
      };
  }
}

export function statusLabel(status: DeviceStatus) {
  switch (status) {
    case "high_salinity":
      return "High Salinity Alert";
    case "low_battery":
      return "Low Battery Alert";
    case "offline":
      return "Offline Alert";
    default:
      return "Active";
  }
}

export function mergeDeviceComputed(device: Device, latest: LatestReading): DeviceComputed {
  return { status: computeStatus(device, latest), latest };
}
