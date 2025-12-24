import { Device } from "../types/device";

const READ_API = import.meta.env.VITE_THINGSPEAK_READ_API_KEY || "FTD33GSX1XHUUFUA";

export const demoDevices: Device[] = [
  {
    id: "can-tho",
    name: "Can Tho Station",
    locationLabel: "Cần Thơ",
    lat: 10.0452,
    lng: 105.7469,
    channelId: 2690349,
    apiKeyRead: READ_API,
    thresholds: { salinityHigh: 10, batteryLow: 20 }
  },
  {
    id: "ca-mau",
    name: "Ca Mau Station",
    locationLabel: "Cà Mau",
    lat: 9.1760,
    lng: 105.1500,
    channelId: 2690349,
    apiKeyRead: READ_API,
    thresholds: { salinityHigh: 12, batteryLow: 25 }
  },
  {
    id: "ben-tre",
    name: "Ben Tre Station",
    locationLabel: "Bến Tre",
    lat: 10.2434,
    lng: 106.3756,
    channelId: 2690349,
    apiKeyRead: READ_API,
    thresholds: { salinityHigh: 9, batteryLow: 18 }
  },
  {
    id: "soc-trang",
    name: "Soc Trang Station",
    locationLabel: "Sóc Trăng",
    lat: 9.6025,
    lng: 105.9739,
    channelId: 2690349,
    apiKeyRead: READ_API,
    thresholds: { salinityHigh: 11, batteryLow: 22 }
  }
];
