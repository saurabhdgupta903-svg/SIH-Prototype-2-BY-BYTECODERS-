"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function ProcessingEnergyPage() {
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

  const d = dashboard!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module N & O: Energy Analytics & Overproduction Detection
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Specific Energy Consumption (SEC) & Emission Intensity
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            National CEA Baseline Grid Factor applied: 0.716 kg CO2e / kWh
          </p>
        </div>
        <SimulatedDataBadge context="Energy meters & machine sub-metering telemetry" />
      </div>

      {d.excess_energy_detected && (
        <div className="bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24] p-3.5 rounded-sm text-[12px]">
          <b>Excess Energy Draw Alert:</b> {d.excess_energy_notes}
        </div>
      )}

      {/* Energy Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#CFCABD] p-4 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Specific Energy Consumption</div>
          <div className="text-2xl font-bold font-mono text-[#A51D24] mt-1">
            {d.energy_kwh_per_tonne} <span className="text-xs font-normal">kWh / tonne</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">
            Baseline threshold: {d.baseline_energy_kwh_per_tonne} kWh/tonne (+19.3% variance)
          </div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-4 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Daily Electrical Consumption</div>
          <div className="text-2xl font-bold font-mono text-[#1B1C1A] mt-1">
            391.6 <span className="text-xs font-normal">kWh</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">Across 3.98 tonnes processed</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-4 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Embedded Grid Emissions Today</div>
          <div className="text-2xl font-bold font-mono text-[#B25E00] mt-1">
            280.4 <span className="text-xs font-normal">kg CO2e</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">CEA National Baseline v19 factor</div>
        </div>
      </div>

      {/* Overproduction & Energy Mitigation Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Sub-System Energy Audit Breakdown
        </h2>

        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
              <th className="py-2 px-3 font-semibold text-left">Production Sub-System</th>
              <th className="py-2 px-3 font-semibold text-right">Power Draw</th>
              <th className="py-2 px-3 font-semibold text-right">Specific Consumption</th>
              <th className="py-2 px-3 font-semibold text-left">Overproduction & Efficiency Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E4DC]">
            <tr>
              <td className="py-2 px-3 font-medium">Grain Cleaning & Sieving Line</td>
              <td className="py-2 px-3 text-right font-mono">14.1 kW</td>
              <td className="py-2 px-3 text-right font-mono">28.2 kWh/t</td>
              <td className="py-2 px-3 text-[#1A6334]">Operating in high efficiency band</td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">Hammer Mill & Pulverizer</td>
              <td className="py-2 px-3 text-right font-mono">23.4 kW</td>
              <td className="py-2 px-3 text-right font-mono">46.8 kWh/t</td>
              <td className="py-2 px-3 text-[#1A6334]">Nominal loading</td>
            </tr>
            <tr className="bg-[#FDF2F2]">
              <td className="py-2 px-3 font-medium text-[#A51D24]">Cold Storage Room A Chiller</td>
              <td className="py-2 px-3 text-right font-mono font-bold text-[#A51D24]">21.4 kW</td>
              <td className="py-2 px-3 text-right font-mono font-bold text-[#A51D24]">23.4 kWh/t</td>
              <td className="py-2 px-3 text-[#A51D24] font-medium">Excess energy draw: Compressor thermal degradation</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
