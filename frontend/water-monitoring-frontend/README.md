# Water Monitoring Frontend (Senior Thesis)

Frontend demo for a battery-powered wireless sensor network dashboard (salinity, pH, temperature, battery, status).
Built with **Vite + React + TypeScript + TailwindCSS**.

## 1) Requirements
- Node.js >= 18

## 2) Setup
```bash
npm install
npm run dev
```

## 3) Build
```bash
npm run build
npm run preview
```

## 4) Environment
Create `.env` (optional):
```env
VITE_THINGSPEAK_READ_API_KEY=FTD33GSX1XHUUFUA
VITE_THINGSPEAK_CHANNEL_ID=2690349
VITE_POLL_INTERVAL_MS=15000
```

## 5) Notes
- This project currently uses **demo devices** and fetches ThingsSpeak for sample charts.
- Admin login is a **demo** (local only). Replace with real auth later.
