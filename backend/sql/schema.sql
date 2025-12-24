CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  salinity FLOAT,
  ph FLOAT,
  temperature FLOAT,
  battery FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
