"use client";

import React, { useState } from "react";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";

export default function WhatIfPlannerPage() {
  const [headcount, setHeadcount] = useState(850);
  const [plannedPortions, setPlannedPortions] = useState(880);
  const [weatherCondition, setWeatherCondition] = useState("normal");
  const [isExamOrHoliday, setIsExamOrHoliday] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/intelligence/what-if", {
        method: "POST",
        body: JSON.stringify({
          kitchen_id: 1,
          meal_type: "lunch",
          planned_production_portions: plannedPortions,
          headcount: headcount,
          weather_condition: weatherCondition,
          is_exam_or_holiday: isExamOrHoliday,
        }),
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runSimulation();
  }, [headcount, plannedPortions, weatherCondition, isExamOrHoliday]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module Y: Institutional Digital Twin
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            What-If Scenario Simulation Planner
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Simulate dynamic changes in attendance, weather extremes, and planned prep to inspect projected surplus, financial loss, and carbon impact.
          </p>
        </div>
        <SimulatedDataBadge context="Real-time mathematical digital twin model" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Sliders & Controls */}
        <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-4">
          <div className="border-b border-[#E7E4DC] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              Simulation Parameters
            </h2>
          </div>

          <div className="space-y-4 text-[13px]">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Campus Headcount:</span>
                <span className="font-mono font-bold text-[#1F4D3A]">{headcount} students</span>
              </div>
              <input
                type="range"
                min="400"
                max="1200"
                step="25"
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value))}
                className="w-full accent-[#1F4D3A]"
              />
              <div className="flex justify-between text-[10px] text-[#80868B]">
                <span>400 (Low)</span>
                <span>850 (Normal)</span>
                <span>1200 (Peak)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Planned Batch Preparation:</span>
                <span className="font-mono font-bold text-[#1F4D3A]">{plannedPortions} portions</span>
              </div>
              <input
                type="range"
                min="400"
                max="1200"
                step="25"
                value={plannedPortions}
                onChange={(e) => setPlannedPortions(parseInt(e.target.value))}
                className="w-full accent-[#1F4D3A]"
              />
              <div className="flex justify-between text-[10px] text-[#80868B]">
                <span>400</span>
                <span>880</span>
                <span>1200</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Weather Condition (Attendance Impact):</label>
              <select
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#CFCABD] rounded-sm text-[13px]"
              >
                <option value="normal">Normal / Dry Climate (100% Turnout)</option>
                <option value="heavy_rain">Heavy Monsoon Precipitation (-10% Turnout)</option>
                <option value="extreme_heat">Severe Heatwave (-6% Turnout)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="holiday-flag"
                checked={isExamOrHoliday}
                onChange={(e) => setIsExamOrHoliday(e.target.checked)}
                className="w-4 h-4 accent-[#1F4D3A]"
              />
              <label htmlFor="holiday-flag" className="text-xs font-medium cursor-pointer">
                Public Holiday / Vacation Period (-35% Turnout)
              </label>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Projected Outcomes */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <div className="bg-white border border-[#CFCABD] rounded-sm p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#1F4D3A] font-bold">
                    Projected Scenario Outcome
                  </div>
                  <h3 className="text-lg font-bold text-[#1B1C1A]">
                    Simulated Surplus: {result.projected_surplus_portions} Portions ({result.projected_surplus_kg} kg)
                  </h3>
                </div>

                <span
                  className={`inline-block px-2.5 py-1 text-xs font-bold rounded-sm ${
                    result.surplus_risk_level === "High"
                      ? "bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24]"
                      : "bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334]"
                  }`}
                >
                  {result.surplus_risk_level} Risk Category
                </span>
              </div>

              {/* 3 Outcome Cards (2x2 Grid) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#F4F2EC] border border-[#CFCABD] rounded-sm">
                  <div className="text-[11px] text-[#5F6368]">Adjusted Demand</div>
                  <div className="text-xl font-bold font-mono text-[#1F4D3A] mt-1">
                    {result.adjusted_predicted_demand} <span className="text-xs font-normal">meals</span>
                  </div>
                  <div className="text-[10px] text-[#80868B]">vs {result.baseline_expected_demand} baseline</div>
                </div>

                <div className="p-3 bg-[#F4F2EC] border border-[#CFCABD] rounded-sm">
                  <div className="text-[11px] text-[#5F6368]">Projected Financial Loss</div>
                  <div className="text-xl font-bold font-mono text-[#A51D24] mt-1">
                    INR {result.projected_waste_cost_inr.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#80868B]">If unrescued</div>
                </div>

                <div className="p-3 bg-[#F4F2EC] border border-[#CFCABD] rounded-sm">
                  <div className="text-[11px] text-[#5F6368]">Projected GHG Footprint</div>
                  <div className="text-xl font-bold font-mono text-[#B25E00] mt-1">
                    {result.projected_carbon_footprint_kg_co2e} <span className="text-xs font-normal">kg CO2e</span>
                  </div>
                  <div className="text-[10px] text-[#80868B]">2.5 kg CO2e / kg factor</div>
                </div>
              </div>

              {/* Directive */}
              <div className="p-4 bg-[#FCFBF9] border border-[#CFCABD] rounded-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A] mb-1">
                  Simulation Recommendation
                </div>
                <p className="text-[13px] text-[#1B1C1A] leading-relaxed">
                  {result.recommended_adjustment}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
