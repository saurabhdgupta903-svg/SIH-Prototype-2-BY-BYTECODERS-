"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function ProcessingEfficiencyPage() {
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

  if (loading) return <SkeletonLoader rows={6} heightClass="h-20" />;

  const d = dashboard!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module N: Processing Unit Performance
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Raw Material Processing Yield & Process Loss Monitoring
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Facility: {d.unit_name} | Daily Capacity: 4,500 kg
          </p>
        </div>
        <SimulatedDataBadge context="Processing line telemetry & intake weighing bridge" />
      </div>

      {d.loss_anomaly_detected && (
        <div className="bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00] p-3.5 rounded-sm text-[12px]">
          <b>Abnormal Process Loss Flagged:</b> {d.loss_anomaly_notes}
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Raw Material Received</div>
          <div className="text-2xl font-bold font-mono text-[#1F4D3A] mt-1">
            {d.raw_material_received_today_kg} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">Weighing bridge total today</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Net Processed Output</div>
          <div className="text-2xl font-bold font-mono text-[#1A6334] mt-1">
            {d.processed_today_kg} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">Yield: {d.yield_efficiency_pct}%</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Process Loss Mass</div>
          <div className="text-2xl font-bold font-mono text-[#B25E00] mt-1">
            {d.process_loss_kg} <span className="text-xs font-normal">kg ({d.process_loss_pct}%)</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">Baseline benchmark: {d.historical_baseline_loss_pct}%</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Energy Consumption Rate</div>
          <div className="text-2xl font-bold font-mono text-[#A51D24] mt-1">
            {d.energy_kwh_per_tonne} <span className="text-xs font-normal">kWh/t</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">Baseline: {d.baseline_energy_kwh_per_tonne} kWh/t</div>
        </div>
      </div>

      {/* Yield & Loss Detailed Diagnostic Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Material Balance & Yield Diagnostics
        </h2>

        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
              <th className="py-2 px-3 font-semibold text-left">Processing Stream</th>
              <th className="py-2 px-3 font-semibold text-right">Mass (kg)</th>
              <th className="py-2 px-3 font-semibold text-right">Yield Share</th>
              <th className="py-2 px-3 font-semibold text-left">Quality & Operational Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E4DC]">
            <tr>
              <td className="py-2.5 px-3 font-medium">Grade-A Cleaned & Milled Grain</td>
              <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1A6334]">3,980.0 kg</td>
              <td className="py-2.5 px-3 text-right font-mono">93.65%</td>
              <td className="py-2.5 px-3 text-[#1A6334]">Passed MoFPI Specification</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-medium">Hulls, Bran & Broken Grains (Secondary Market)</td>
              <td className="py-2.5 px-3 text-right font-mono">180.0 kg</td>
              <td className="py-2.5 px-3 text-right font-mono">4.24%</td>
              <td className="py-2.5 px-3 text-[#4A4D4A]">Diverted to Animal Feed Recovery Path</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-medium">Moisture Loss & Dust Residue</td>
              <td className="py-2.5 px-3 text-right font-mono text-[#A51D24]">90.0 kg</td>
              <td className="py-2.5 px-3 text-right font-mono">2.11%</td>
              <td className="py-2.5 px-3 text-[#A51D24]">Unavoidable Thermal Evaporation</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
