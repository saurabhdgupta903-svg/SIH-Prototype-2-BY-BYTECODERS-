"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function ProcurementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest("/api/intelligence/procurement-recommendations");
        setItems(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <SkeletonLoader rows={5} heightClass="h-16" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module Q: Procurement Intelligence
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Inventory & Demand-Driven Purchase Directives
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Synthesizes current pantry stock, forecast consumption, and surplus buffers into decisive purchase recommendations.
          </p>
        </div>
        <SimulatedDataBadge context="Inventory levels linked to campus menu forecast" />
      </div>

      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Commodity Procurement Advisory Table
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Commodity</th>
                <th className="py-2 px-3 font-semibold text-right">Current Stock</th>
                <th className="py-2 px-3 font-semibold text-right">Predicted 24h Need</th>
                <th className="py-2 px-3 font-semibold text-right">Recommended Order</th>
                <th className="py-2 px-3 font-semibold">Action Directive</th>
                <th className="py-2 px-3 font-semibold">Mathematical Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {items.map((item) => (
                <tr key={item.item_id} className="hover:bg-[#FCFBF9]">
                  <td className="py-2.5 px-3 font-medium text-[#1B1C1A]">{item.item_name}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{item.current_stock_kg} kg</td>
                  <td className="py-2.5 px-3 text-right font-mono">{item.predicted_demand_kg} kg</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    {item.recommended_procure_kg} kg
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                        item.action_decision === "DO NOT PROCURE"
                          ? "bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24]"
                          : item.action_decision === "PROCURE MINIMAL"
                          ? "bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00]"
                          : "bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334]"
                      }`}
                    >
                      {item.action_decision}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#5F6368] text-[11px] max-w-sm">{item.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
