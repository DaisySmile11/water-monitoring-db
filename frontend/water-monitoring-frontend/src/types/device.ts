export type DeviceStatus = "active" | "offline" | "low_battery" | "high_salinity";

export type Device = {
  id: string;
  name: string;
  locationLabel: string;
  lat: number;
  lng: number;
  channelId: number;
  apiKeyRead?: string;
  thresholds: {
    salinityHigh: number;
    batteryLow: number;
  };
};

export type LatestReading = {
  createdAt: string;
  salinity: number;      // ppt
  ph: number;            // pH
  temperature: number;   // °C
  battery: number;       // %
};

export type DeviceComputed = {
  status: DeviceStatus;
  latest: LatestReading;
};
