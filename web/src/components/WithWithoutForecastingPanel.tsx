import React from "react";
import { SimulatedDataBadge } from "./SimulatedDataBadge";

interface Props {
  data?: {
    scenario?: string;
    planned_production_uncalibrated: number;
    actual_demand: number;
    unmitigated_surplus: number;
    prevented_by_forecasting: number;
    redistributed_to_receivers: number;
    total_waste_avoided: number;
    cost_saved_inr: number;
    co2e_avoided_kg: number;
  };
}

export function WithWithoutForecastingPanel({ data }: Props) {
  const d = data || {
    planned_production_uncalibrated: 900,
    actual_demand: 820,
    unmitigated_surplus: 80,
    prevented_by_forecasting: 35,
    redistributed_to_receivers: 45,
    total_waste_avoided: 80,
    cost_saved_inr: 5200.0,
    co2e_avoided_kg: 200.0,
  };

  return (
    <div className="bg-white border border-[#CFCABD] rounded-sm p-4 text-[#1B1C1A]">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E7E4DC] mb-3">
        <div>
          <h3 className="font-bold text-sm text-[#1F4D3A] tracking-wide uppercase">
            Performance Impact: With vs Without Forecasting
          </h3>
          <p className="text-[12px] text-[#5F6368]">
            Calculated contrast between traditional fixed prep batching versus data-driven demand planning.
          </p>
        </div>
        <SimulatedDataBadge context="Production cycle comparison" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
              <th className="py-2 px-3 font-semibold">Operating Parameter</th>
              <th className="py-2 px-3 font-semibold text-right">Without FoodLoop (Traditional)</th>
              <th className="py-2 px-3 font-semibold text-right bg-[#EBF5EE] text-[#1A6334]">
                With FoodLoop (Active)
              </th>
              <th className="py-2 px-3 font-semibold text-right">Net Operational Gain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E4DC]">
            <tr>
              <td className="py-2 px-3 font-medium">Planned Batch Preparation</td>
              <td className="py-2 px-3 text-right font-mono">{d.planned_production_uncalibrated} meals</td>
              <td className="py-2 px-3 text-right font-mono bg-[#EBF5EE] text-[#1A6334]">
                {d.actual_demand + (d.unmitigated_surplus - d.prevented_by_forecasting)} meals
              </td>
              <td className="py-2 px-3 text-right font-mono text-[#1A6334]">
                -{d.prevented_by_forecasting} overproduced
              </td>
            </tr>

            <tr>
              <td className="py-2 px-3 font-medium">Actual Consumer Demand</td>
              <td className="py-2 px-3 text-right font-mono">{d.actual_demand} meals</td>
              <td className="py-2 px-3 text-right font-mono bg-[#EBF5EE] text-[#1A6334]">
                {d.actual_demand} meals
              </td>
              <td className="py-2 px-3 text-right font-mono text-[#5F6368]">100% Demand Met</td>
            </tr>

            <tr>
              <td className="py-2 px-3 font-medium">Unmitigated Surplus Generated</td>
              <td className="py-2 px-3 text-right font-mono text-[#A51D24]">
                {d.unmitigated_surplus} meals
              </td>
              <td className="py-2 px-3 text-right font-mono bg-[#EBF5EE] text-[#1A6334]">
                {d.redistributed_to_receivers} meals
              </td>
              <td className="py-2 px-3 text-right font-mono text-[#1A6334]">
                -{d.prevented_by_forecasting} pre-empted
              </td>
            </tr>

            <tr>
              <td className="py-2 px-3 font-medium">Prevented by Source Forecasting</td>
              <td className="py-2 px-3 text-right font-mono text-[#5F6368]">0 meals</td>
              <td className="py-2 px-3 text-right font-mono bg-[#EBF5EE] text-[#1A6334] font-semibold">
                {d.prevented_by_forecasting} meals
              </td>
              <td className="py-2 px-3 text-right font-mono text-[#1A6334]">Pre-production reduction</td>
            </tr>

            <tr>
              <td className="py-2 px-3 font-medium">Redistributed to Verified Receivers</td>
              <td className="py-2 px-3 text-right font-mono text-[#5F6368]">0 meals</td>
              <td className="py-2 px-3 text-right font-mono bg-[#EBF5EE] text-[#1A6334] font-semibold">
                {d.redistributed_to_receivers} meals
              </td>
              <td className="py-2 px-3 text-right font-mono text-[#1A6334]">Community diversion</td>
            </tr>

            <tr className="bg-[#FCFBF9] font-bold">
              <td className="py-2.5 px-3 text-[#1F4D3A]">Total Net Landfill Waste Avoided</td>
              <td className="py-2.5 px-3 text-right font-mono text-[#A51D24]">0 meals avoided (100% waste)</td>
              <td className="py-2.5 px-3 text-right font-mono bg-[#EBF5EE] text-[#1A6334]">
                {d.total_waste_avoided} meals avoided
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-[#1A6334]">
                100% Diverted from Landfill
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E7E4DC] flex flex-wrap items-center justify-between text-[11px] text-[#5F6368] gap-3">
        <div className="flex items-center gap-4">
          <span>
            Financial Loss Avoided: <b className="font-mono text-[#1B1C1A]">INR {d.cost_saved_inr.toLocaleString()}</b>
          </span>
          <span>
            Carbon Avoidance: <b className="font-mono text-[#1B1C1A]">{d.co2e_avoided_kg} kg CO2e</b>
          </span>
        </div>
        <div className="text-[10px] text-[#80868B]">
          Formula: Total Avoided = Prevented by Forecasting ({d.prevented_by_forecasting}) + Redistributed ({d.redistributed_to_receivers})
        </div>
      </div>
    </div>
  );
}
