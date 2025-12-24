# Water Monitoring Fullstack (1 link)

## Structure
```
water-monitoring-fullstack/
  backend/
  frontend/water-monitoring-frontend/
```

## Run locally
### 1) Frontend build (creates dist/)
```bash
cd frontend/water-monitoring-frontend
npm install
npm run build
```

### 2) Backend run (serves frontend dist + APIs)
```bash
cd ../../backend
npm install
cp .env.example .env
npm run dev
```

Open: http://localhost:5000

## API
- GET /api/readings/latest
- GET /api/readings?from=YYYY-MM-DD&to=YYYY-MM-DD
- POST /api/readings
