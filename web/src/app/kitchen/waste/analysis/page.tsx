"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../../lib/api";
import { SimulatedDataBadge } from "../../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../../components/SkeletonLoader";

export default function WasteAnalysisPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest("/api/waste/analysis");
        setAnalysis(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <SkeletonLoader rows={6} heightClass="h-16" />;

  const a = analysis!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module F: Root Cause Waste Analytics
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Composition & Cause Analysis Breakdown
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Itemized breakdown across food categories and operational failure causes.
          </p>
        </div>
        <SimulatedDataBadge context="Aggregated from 12-month kitchen logs" />
      </div>

      {/* Main Cause Banner */}
      <div className="bg-[#FEF7EE] border border-[#B25E00] rounded-sm p-4 text-[13px]">
        <div className="font-bold text-[#B25E00] uppercase tracking-wider text-xs mb-1">
          Primary Loss Vector Identified
        </div>
        <div className="text-base font-bold text-[#1B1C1A]">
          {a.primary_cause}
        </div>
        <div className="mt-2 text-[#4A4D4A] space-y-1">
          {a.actionable_recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#B25E00] font-bold">›</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Split Grids: Breakdown by Food Item & Breakdown by Reason */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown by Food Item */}
        <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-4">
          <div className="border-b border-[#E7E4DC] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              1. Waste Distribution by Food Item
            </h2>
          </div>

          <div className="space-y-3">
            {a.by_food_item.map((item: any, idx: number) => (
              <div key={idx} className="space-y-1 text-[12px]">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#1B1C1A]">{item.name}</span>
                  <span className="font-mono text-[#4A4D4A]">
                    {item.quantity_kg} kg ({item.percentage}%)
                  </span>
                </div>
                {/* Flat Progress Bar (No Gradients) */}
                <div className="w-full bg-[#E7E4DC] h-2.5 rounded-sm overflow-hidden">
                  <div
                    className="bg-[#1F4D3A] h-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown by Cause */}
        <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-4">
          <div className="border-b border-[#E7E4DC] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              2. Waste Distribution by Operational Cause
            </h2>
          </div>

          <div className="space-y-3">
            {a.by_reason.map((reason: any, idx: number) => (
              <div key={idx} className="space-y-1 text-[12px]">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#1B1C1A]">{reason.reason}</span>
                  <span className="font-mono text-[#4A4D4A]">
                    {reason.quantity_kg} kg ({reason.percentage}%)
                  </span>
                </div>
                {/* Flat Progress Bar (No Gradients) */}
                <div className="w-full bg-[#E7E4DC] h-2.5 rounded-sm overflow-hidden">
                  <div
                    className="bg-[#4A4D4A] h-full"
                    style={{ width: `${reason.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
