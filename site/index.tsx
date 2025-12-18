import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

interface TemperatureReading {
  id: number;
  temperature: number;
  timestamp: string;
}

const Home = () => {
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = async () => {
    try {
      const response = await fetch("/readings");
      if (!response.ok) throw new Error("Failed to fetch readings");
      const data = await response.json();
      setReadings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchReadings, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const currentReading = readings[0];
  const stats = React.useMemo(() => {
    if (readings.length === 0) return null;
    const temps = readings.map((r) => r.temperature);
    return {
      max: Math.max(...temps),
      min: Math.min(...temps),
      avg: temps.reduce((a, b) => a + b, 0) / temps.length,
    };
  }, [readings]);

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading temperature data</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="header">
          <h1>🌡️ Pi Weather Station</h1>
          <p>Real-time temperature monitoring</p>
        </div>
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div>
        <div className="header">
          <h1>🌡️ Pi Weather Station</h1>
          <p>Real-time temperature monitoring</p>
        </div>
        <div className="empty-state">
          <p>No temperature readings yet</p>
          <p>Waiting for data collection to begin...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <h1>🌡️ Pi Weather Station</h1>
        <p>Real-time temperature monitoring from Raspberry Pi</p>
      </div>

      {/* Current Temperature */}
      <div className="card current-temp">
        <div className="temp-label">Current Temperature</div>
        <div className="temp-value">
          {currentReading?.temperature?.toFixed(1)}°C
        </div>
        <div className="temp-time">
          Last updated: {formatTime(currentReading?.timestamp)}
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Maximum</div>
            <div className="stat-value">{stats.max.toFixed(1)}°C</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Minimum</div>
            <div className="stat-value">{stats.min.toFixed(1)}°C</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average</div>
            <div className="stat-value">{stats.avg.toFixed(1)}°C</div>
          </div>
        </div>
      )}

      {/* Readings History */}
      <div className="card readings-section">
        <h2 className="section-title">
          Temperature History ({readings.length} readings)
        </h2>
        <div className="readings-list">
          {readings.map((reading) => (
            <div key={reading.id} className="reading-item">
              <span className="reading-temp">
                {reading.temperature.toFixed(1)}°C
              </span>
              <span className="reading-time">
                {formatTime(reading.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById("root") as HTMLDivElement;
const root = createRoot(container);
root.render(<Home />);
