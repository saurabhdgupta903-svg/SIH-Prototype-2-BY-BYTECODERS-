"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function MachineMonitoringPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest("/api/processing/dashboard");
        setDashboard(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <SkeletonLoader rows={6} heightClass="h-16" />;

  const machines = dashboard?.machines || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module P: Machinery & Preventive Maintenance
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Processing Machinery Health & Telemetry Telematics
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Status tracking across milling, cleaning, and refrigeration compressors with statistical anomaly detection.
          </p>
        </div>
        <SimulatedDataBadge context="PLC telemetry simulator & current transducer feeds" />
      </div>

      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Connected Production Equipment Status
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Equipment Name</th>
                <th className="py-2 px-3 font-semibold">Machine Classification</th>
                <th className="py-2 px-3 font-semibold">Operating State</th>
                <th className="py-2 px-3 font-semibold text-right">Yield Efficiency</th>
                <th className="py-2 px-3 font-semibold text-right">Power Draw (kW)</th>
                <th className="py-2 px-3 font-semibold text-right">Runtime Today</th>
                <th className="py-2 px-3 font-semibold">Anomaly & Fault Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {machines.map((m: any) => (
                <tr key={m.id} className="hover:bg-[#FCFBF9]">
                  <td className="py-2.5 px-3 font-medium text-[#1B1C1A]">{m.name}</td>
                  <td className="py-2.5 px-3 text-[#5F6368]">{m.machine_type}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                        m.status === "Running"
                          ? "bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334]"
                          : m.status === "Reduced efficiency"
                          ? "bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00]"
                          : "bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24]"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    {m.current_efficiency_pct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {m.current_power_draw_kw} / {m.rated_power_kw} kW
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {m.operating_hours_today} hrs
                  </td>
                  <td className="py-2.5 px-3 text-[11px]">
                    {m.is_anomaly ? (
                      <span className="text-[#A51D24] font-medium">{m.anomaly_detail}</span>
                    ) : (
                      <span className="text-[#1A6334]">Operating nominally</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
