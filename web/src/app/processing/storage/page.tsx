"use client";

import React, { useEffect, useState, useRef } from "react";
import { WS_BASE_URL } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";

export default function ColdStoragePage() {
  const [telemetry, setTelemetry] = useState({
    temperature_c: 11.2,
    humidity_pct: 84.0,
    door_status: "open",
    power_draw_kw: 21.4,
    is_anomaly: true,
    anomaly_message: "Potential storage issue detected: temperature (11.2°C) exceeds 8.0°C safety threshold",
    location: "Cold Storage Room A",
  });
  const [history, setHistory] = useState<any[]>([
    { time: "21:30", temp: 4.8, status: "Normal" },
    { time: "21:45", temp: 5.4, status: "Normal" },
    { time: "22:00", temp: 7.9, status: "Advisory" },
    { time: "22:15", temp: 11.2, status: "Critical Anomaly" },
  ]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      const ws = new WebSocket(`${WS_BASE_URL}/ws/storage-sensors`);
      wsRef.current = ws;
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "SENSOR_TELEMETRY" && payload.data) {
            setTelemetry(payload.data);
            setHistory((prev) => [
              ...prev.slice(-6),
              {
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                temp: payload.data.temperature_c,
                status: payload.data.is_anomaly ? "Critical Anomaly" : "Normal",
              },
            ]);
          }
        } catch (e) {
          console.error(e);
        }
      };
      ws.onclose = () => setWsConnected(false);
    } catch {
      console.warn("WebSocket not available for storage telemetry.");
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module O: IoT Cold Chain Telemetry
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Cold Storage Atmospheric & Thermodynamic Monitoring
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Chamber: Cold Room A (Capacity: 800 kg perishable holding)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedDataBadge context="IoT sensor feed over WebSocket" />
          <div className="flex items-center gap-1.5 text-[11px] bg-white border border-[#CFCABD] px-2 py-1 rounded-sm">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-[#1A6334]" : "bg-[#B25E00]"}`} />
            <span>{wsConnected ? "Sensor Feed Active (WebSocket)" : "Simulated Feed"}</span>
          </div>
        </div>
      </div>

      {/* Critical Storage Anomaly Alert */}
      {telemetry.is_anomaly && (
        <div className="bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24] p-4 rounded-sm text-[13px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold uppercase tracking-wider text-xs">
              ⚠️ Storage Anomaly Detected: Persistent Temperature Drift
            </div>
            <div className="mt-1">{telemetry.anomaly_message}</div>
          </div>
          <button
            onClick={() => alert("Maintenance work order FL-WO-8821 dispatched to refrigeration engineer.")}
            className="bg-[#A51D24] text-white px-3 py-1.5 text-xs font-semibold rounded-sm hover:bg-[#83171D] shrink-0"
          >
            Dispatch Technician Work Order
          </button>
        </div>
      )}

      {/* 4 Sensor Metric Panels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`p-4 border rounded-sm ${telemetry.temperature_c > 8 ? "bg-[#FDF2F2] border-[#A51D24]" : "bg-white border-[#CFCABD]"}`}>
          <div className="text-[11px] text-[#5F6368] font-medium">Chamber Temperature</div>
          <div className={`text-3xl font-bold font-mono mt-1 ${telemetry.temperature_c > 8 ? "text-[#A51D24]" : "text-[#1F4D3A]"}`}>
            {telemetry.temperature_c.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">Setpoint: 4.0°C (Threshold: 8.0°C)</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-4 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Relative Humidity</div>
          <div className="text-3xl font-bold font-mono text-[#1F4D3A] mt-1">
            {telemetry.humidity_pct}%
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">Optimal range: 75% - 88%</div>
        </div>

        <div className={`p-4 border rounded-sm ${telemetry.door_status === "open" ? "bg-[#FEF7EE] border-[#B25E00]" : "bg-white border-[#CFCABD]"}`}>
          <div className="text-[11px] text-[#5F6368] font-medium">Access Door Magnetic Contact</div>
          <div className="text-2xl font-bold uppercase mt-1 text-[#1B1C1A]">
            {telemetry.door_status}
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">Air curtain active</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-4 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Compressor Electrical Load</div>
          <div className="text-3xl font-bold font-mono text-[#B25E00] mt-1">
            {telemetry.power_draw_kw} <span className="text-sm font-normal">kW</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">+18.8% above baseline (18.0 kW)</div>
        </div>
      </div>

      {/* Sensor Drift Historical Progression Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Recent Sensor Log (3-Sigma Rolling Anomaly Detection)
        </h2>

        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
              <th className="py-2 px-3 font-semibold text-left">Time Recorded</th>
              <th className="py-2 px-3 font-semibold text-right">Temperature Reading</th>
              <th className="py-2 px-3 font-semibold text-left">Deviation from Setpoint</th>
              <th className="py-2 px-3 font-semibold text-left">Statistical Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E4DC]">
            {history.map((h, idx) => (
              <tr key={idx} className="hover:bg-[#FCFBF9]">
                <td className="py-2 px-3 font-mono">{h.time}</td>
                <td className="py-2 px-3 text-right font-mono font-bold">{h.temp}°C</td>
                <td className="py-2 px-3 font-mono text-[#5F6368]">
                  +{(h.temp - 4.0).toFixed(1)}°C
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${
                      h.status === "Critical Anomaly"
                        ? "bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24]"
                        : h.status === "Advisory"
                        ? "bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00]"
                        : "bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334]"
                    }`}
                  >
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
