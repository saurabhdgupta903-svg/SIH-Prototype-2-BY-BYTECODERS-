"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";

export default function CostCalculatorPage() {
  const [wasteKg, setWasteKg] = useState("84.5");
  const [rmCost, setRmCost] = useState("65.0");
  const [laborCost, setLaborCost] = useState("18.0");
  const [energyCost, setEnergyCost] = useState("8.5");
  const [waterCost, setWaterCost] = useState("3.2");
  const [disposalCost, setDisposalCost] = useState("4.0");
  const [result, setResult] = useState<any>(null);

  const calculateCost = async () => {
    try {
      const res = await apiRequest("/api/intelligence/cost-of-waste", {
        method: "POST",
        body: JSON.stringify({
          waste_kg: parseFloat(wasteKg) || 0,
          raw_material_cost_per_kg: parseFloat(rmCost) || 0,
          labor_cost_per_kg: parseFloat(laborCost) || 0,
          energy_cost_per_kg: parseFloat(energyCost) || 0,
          water_cost_per_kg: parseFloat(waterCost) || 0,
          disposal_cost_per_kg: parseFloat(disposalCost) || 0,
        }),
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    calculateCost();
  }, [wasteKg, rmCost, laborCost, energyCost, waterCost, disposalCost]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module R: Economic Loss Calculator
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Comprehensive Cost of Food Waste Estimator
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Itemizes raw ingredients, kitchen labor hours, energy cooking fuel, water consumption, and municipal disposal tariffs.
          </p>
        </div>
        <SimulatedDataBadge context="Editable baseline cost assumptions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Editable Assumptions */}
        <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-4">
          <div className="border-b border-[#E7E4DC] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              Editable Assumptions (INR / kg)
            </h2>
          </div>

          <div className="space-y-3 text-[13px]">
            <div>
              <label className="block text-xs font-medium mb-1">Weekly Waste Mass (kg)</label>
              <input
                type="number"
                value={wasteKg}
                onChange={(e) => setWasteKg(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Raw Material Value (INR / kg)</label>
              <input
                type="number"
                value={rmCost}
                onChange={(e) => setRmCost(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Kitchen Labor Cost (INR / kg)</label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Cooking Energy / Fuel (INR / kg)</label>
              <input
                type="number"
                value={energyCost}
                onChange={(e) => setEnergyCost(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Embedded Water & Cleaning (INR / kg)</label>
              <input
                type="number"
                value={waterCost}
                onChange={(e) => setWaterCost(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Municipal Disposal Fee (INR / kg)</label>
              <input
                type="number"
                value={disposalCost}
                onChange={(e) => setDisposalCost(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Cost Breakdown & 20% Target Projection */}
        <div className="lg:col-span-2 space-y-4">
          {result && (
            <div className="bg-white border border-[#CFCABD] rounded-sm p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#5F6368]">
                    Estimated Financial Loss ({result.waste_kg} kg waste)
                  </div>
                  <h3 className="text-2xl font-bold font-mono text-[#A51D24] mt-0.5">
                    INR {result.total_estimated_loss_inr.toLocaleString()}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#5F6368]">Unit Loss Rate:</span>
                  <div className="font-mono font-bold text-[#1B1C1A]">
                    INR {(result.total_estimated_loss_inr / result.waste_kg).toFixed(2)} / kg
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                      <th className="py-2 px-3 font-semibold">Cost Component</th>
                      <th className="py-2 px-3 font-semibold text-right">Applied Rate (INR/kg)</th>
                      <th className="py-2 px-3 font-semibold text-right">Subtotal Estimated Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E4DC]">
                    <tr>
                      <td className="py-2 px-3 font-medium">Direct Raw Material Ingredients</td>
                      <td className="py-2 px-3 text-right font-mono">INR {rmCost}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#1B1C1A]">
                        INR {result.raw_material_loss_inr.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Culinary & Kitchen Prep Labor</td>
                      <td className="py-2 px-3 text-right font-mono">INR {laborCost}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#1B1C1A]">
                        INR {result.labor_loss_inr.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Gas / Electric Cooking Energy</td>
                      <td className="py-2 px-3 text-right font-mono">INR {energyCost}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#1B1C1A]">
                        INR {result.energy_loss_inr.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Water Embedded & Sanitize</td>
                      <td className="py-2 px-3 text-right font-mono">INR {waterCost}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#1B1C1A]">
                        INR {result.water_loss_inr.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Solid Waste Municipal Disposal</td>
                      <td className="py-2 px-3 text-right font-mono">INR {disposalCost}</td>
                      <td className="py-2 px-3 text-right font-mono text-[#1B1C1A]">
                        INR {result.disposal_loss_inr.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 20% Reduction Avoidance Target */}
              <div className="p-4 bg-[#EBF5EE] border border-[#1A6334] rounded-sm text-[12px] space-y-1">
                <div className="font-bold text-[#1A6334] uppercase tracking-wider text-xs">
                  20% Prevention Opportunity Target
                </div>
                <p className="text-[#1B1C1A] leading-relaxed">
                  {result.savings_opportunity_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
