"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { WithWithoutForecastingPanel } from "../../../components/WithWithoutForecastingPanel";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

interface DashboardData {
  date: string;
  total_expected_demand: number;
  total_recommended_production: number;
  total_current_production: number;
  total_predicted_surplus_min: number;
  total_predicted_surplus_max: number;
  food_at_risk_kg: number;
  waste_this_week_kg: number;
  waste_last_week_kg: number;
  waste_percentage_change: number;
  action_list: string[];
  meals: any[];
  with_vs_without: any;
  is_simulated: boolean;
}

export default function KitchenDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [surplusSimulating, setSurplusSimulating] = useState(false);
  const [simulationTriggered, setSimulationTriggered] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await apiRequest<DashboardData>("/api/forecast/dashboard");
      setData(res);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSimulateSurplus = async () => {
    setSurplusSimulating(true);
    try {
      // Step 2 in 5-minute demo: simulate 45 meals surplus
      await apiRequest("/api/surplus/create", {
        method: "POST",
        body: JSON.stringify({
          kitchen_id: 1,
          food_item_id: 1,
          description: "Cooked Basmati Rice and Toor Dal Combo (45 portions)",
          quantity_kg: 19.5,
          estimated_portions: 45,
          prepared_at: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
          ready_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          safe_pickup_window_start: new Date().toISOString(),
          safe_pickup_window_end: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
          storage_temp_c: 63.5,
          is_perishable: true,
        }),
      });
      setSimulationTriggered(true);
      fetchDashboard();
    } catch (err) {
      console.error("Error creating demo surplus:", err);
    } finally {
      setSurplusSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader rows={2} heightClass="h-8" />
        <SkeletonLoader rows={4} heightClass="h-24" />
      </div>
    );
  }

  const d = data!;

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Institutional Kitchen Management
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Daily Operational Kitchen Dashboard
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Date: {d.date} | Facility: Sahyadri Central Mega Kitchen | Shift: Dinner Prep Cycle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedDataBadge context="Consumption model & telemetry" />
          <button
            onClick={handleSimulateSurplus}
            disabled={surplusSimulating || simulationTriggered}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-sm border ${
              simulationTriggered
                ? "bg-[#EBF5EE] text-[#1A6334] border-[#1A6334]"
                : "bg-[#1F4D3A] text-white border-[#1F4D3A] hover:bg-[#16382A]"
            }`}
          >
            {surplusSimulating
              ? "Triggering..."
              : simulationTriggered
              ? "✓ Demo 45 Meals Surplus Active"
              : "Demo Step 2: Simulate 45 Meals Surplus"}
          </button>
        </div>
      </div>

      {simulationTriggered && (
        <div className="bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00] p-3 rounded-sm text-[12px] flex items-center justify-between">
          <span>
            <b>Surplus Pre-alert Created:</b> Potential surplus of 45 meals identified (Traceability ID: FL-2026-000182). Level 2 visual risk check required.
          </span>
          <Link
            href="/kitchen/quality"
            className="bg-[#B25E00] text-white px-2.5 py-1 rounded-sm text-[11px] font-medium hover:underline shrink-0 ml-3"
          >
            Go to Safety Check →
          </Link>
        </div>
      )}

      {/* Primary KPI Grid (6 metrics, no 3 in a row - 2x3 or 4+2 dense grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] font-medium text-[#5F6368]">Expected Demand (Today)</div>
          <div className="text-2xl font-bold font-mono text-[#1F4D3A] mt-1">
            {d.total_expected_demand} <span className="text-xs font-normal">portions</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">Sum across 3 daily meal shifts</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] font-medium text-[#5F6368]">Recommended Production</div>
          <div className="text-2xl font-bold font-mono text-[#1A6334] mt-1">
            {d.total_recommended_production} <span className="text-xs font-normal">portions</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">+3% safety operational buffer</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] font-medium text-[#5F6368]">Predicted Surplus Range</div>
          <div className="text-2xl font-bold font-mono text-[#B25E00] mt-1">
            {d.total_predicted_surplus_min} - {d.total_predicted_surplus_max} <span className="text-xs font-normal">meals</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">Between 08:00 and 09:30 PM</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] font-medium text-[#5F6368]">Food at Risk (Surplus Mass)</div>
          <div className="text-2xl font-bold font-mono text-[#A51D24] mt-1">
            {d.food_at_risk_kg.toFixed(1)} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-1">Requires redistribution release</div>
        </div>
      </div>

      {/* Dense Row: Waste This Week & Week-over-Week Trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm md:col-span-1">
          <div className="text-[11px] font-medium text-[#5F6368]">Waste Recorded This Week</div>
          <div className="text-xl font-bold font-mono text-[#1B1C1A] mt-1">
            {d.waste_this_week_kg} kg
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="font-mono text-[#1A6334] font-semibold">{d.waste_percentage_change}%</span>
            <span className="text-[#5F6368]">vs last week ({d.waste_last_week_kg} kg)</span>
          </div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm md:col-span-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#1F4D3A] mb-1.5">
            Real-Time Data-Derived Kitchen Recommendations
          </div>
          <div className="space-y-1.5 text-[12px] text-[#1B1C1A]">
            {d.action_list.map((act, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#1F4D3A] font-bold">›</span>
                <span className="leading-snug">{act}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meal Shift Breakdown Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-2">
          <h2 className="font-bold text-xs uppercase tracking-wider text-[#1F4D3A]">
            Shift-by-Shift Demand Forecast & Production Targets
          </h2>
          <Link href="/kitchen/forecast" className="text-[12px] text-[#1F4D3A] hover:underline font-medium">
            View Model Metrics & Forecast Intervals →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Meal Shift</th>
                <th className="py-2 px-3 font-semibold text-right">Predicted Demand</th>
                <th className="py-2 px-3 font-semibold text-right">Recommended Prep</th>
                <th className="py-2 px-3 font-semibold text-right">Planned Prep</th>
                <th className="py-2 px-3 font-semibold text-right">Expected Surplus</th>
                <th className="py-2 px-3 font-semibold">Surplus Risk Level</th>
                <th className="py-2 px-3 font-semibold">Action Derived from Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {d.meals.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#FCFBF9]">
                  <td className="py-2.5 px-3 font-medium capitalize text-[#1F4D3A]">{m.meal_type}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{m.predicted_demand_portions}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#1A6334] font-medium">
                    {m.recommended_production_portions}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{m.planned_production_portions}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {m.predicted_surplus_portions > 0 ? `+${m.predicted_surplus_portions}` : "0"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                        m.surplus_risk_level === "High"
                          ? "bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24]"
                          : m.surplus_risk_level === "Medium"
                          ? "bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00]"
                          : "bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334]"
                      }`}
                    >
                      {m.surplus_risk_level} Risk
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#4A4D4A] max-w-xs">{m.action_recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* "With vs Without Forecasting" Comparison Panel */}
      <WithWithoutForecastingPanel data={d.with_vs_without} />

      {/* Quick Action Bar for Demonstration */}
      <div className="bg-[#FCFBF9] border border-[#CFCABD] p-3 rounded-sm flex flex-wrap items-center justify-between text-[12px] gap-2">
        <span className="text-[#5F6368] font-medium">
          Demonstration Navigation Sequence (5-Minute Workflow):
        </span>
        <div className="flex items-center gap-2">
          <Link href="/kitchen/quality" className="bg-white border border-[#CFCABD] px-2.5 py-1 rounded-sm hover:bg-[#F4F2EC]">
            3. Food Safety Clearance →
          </Link>
          <Link href="/kitchen/surplus" className="bg-white border border-[#CFCABD] px-2.5 py-1 rounded-sm hover:bg-[#F4F2EC]">
            4. Receiver Matching →
          </Link>
          <Link href="/driver/route" className="bg-white border border-[#CFCABD] px-2.5 py-1 rounded-sm hover:bg-[#F4F2EC]">
            5. Route & Live Tracking →
          </Link>
          <Link href="/kitchen/reports" className="bg-white border border-[#CFCABD] px-2.5 py-1 rounded-sm hover:bg-[#F4F2EC]">
            7. Sustainability & ESG PDF →
          </Link>
        </div>
      </div>
    </div>
  );
}
