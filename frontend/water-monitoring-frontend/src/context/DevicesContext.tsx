import { createContext, useContext, useMemo, useState } from "react";
import { demoDevices } from "../data/demoDevices";
import { Device } from "../types/device";

type DevicesContextValue = {
  devices: Device[];
  addDevice: (d: Device) => void;
  removeDevice: (id: string) => void;
};

const DevicesContext = createContext<DevicesContextValue | null>(null);

export function DevicesProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(() => {
    const raw = localStorage.getItem("devices");
    if (raw) {
      try {
        return JSON.parse(raw) as Device[];
      } catch {
        return demoDevices;
      }
    }
    return demoDevices;
  });

  const persist = (next: Device[]) => {
    setDevices(next);
    localStorage.setItem("devices", JSON.stringify(next));
  };

  const addDevice = (d: Device) => {
    persist([d, ...devices]);
  };

  const removeDevice = (id: string) => {
    persist(devices.filter((x) => x.id !== id));
  };

  const value = useMemo(() => ({ devices, addDevice, removeDevice }), [devices]);

  return <DevicesContext.Provider value={value}>{children}</DevicesContext.Provider>;
}

export function useDevices() {
  const ctx = useContext(DevicesContext);
  if (!ctx) throw new Error("useDevices must be used within DevicesProvider");
  return ctx;
}
