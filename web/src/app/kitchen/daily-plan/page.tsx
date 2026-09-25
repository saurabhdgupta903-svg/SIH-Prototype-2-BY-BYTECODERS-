"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function DailyActionPlanPage() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      try {
        const data = await apiRequest("/api/intelligence/daily-action-plan");
        setPlan(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  if (loading) return <SkeletonLoader rows={5} heightClass="h-16" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module Z: Daily Operational Plan
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Kitchen Head Chef Morning Action Sheet
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Date: {plan.date} | Facility: {plan.institution_name}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-white border border-[#CFCABD] text-[#1B1C1A] px-3 py-1.5 text-[12px] font-medium rounded-sm hover:bg-[#F4F2EC] flex items-center gap-1.5"
        >
          <span>Print Action Sheet</span>
        </button>
      </div>

      {/* Shifts Action Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          1. Meal Production Directives
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Shift Window</th>
                <th className="py-2 px-3 font-semibold text-right">Expected Headcount</th>
                <th className="py-2 px-3 font-semibold text-right">Target Production</th>
                <th className="py-2 px-3 font-semibold">Chef Directive Derived from Models</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {plan.shift_schedule.map((shift: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#FCFBF9]">
                  <td className="py-2.5 px-3 font-medium text-[#1F4D3A]">{shift.meal}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{shift.headcount_expected}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1A6334]">
                    {shift.recommended_production}
                  </td>
                  <td className="py-2.5 px-3 text-[#1B1C1A]">{shift.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Split: Procurement Holds & Standby Receivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Procurement Holds */}
        <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A51D24]">
            2. Procurement Holds (Do Not Purchase Today)
          </h2>
          <div className="space-y-2 text-[12px]">
            {plan.procurement_holds.map((hold: string, idx: number) => (
              <div key={idx} className="p-2.5 bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24] rounded-sm flex items-start gap-2">
                <span className="font-bold">⛔</span>
                <span>{hold}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Standby Receivers */}
        <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
            3. Standby Redistribution Receivers (Evening Shift)
          </h2>
          <div className="space-y-2 text-[12px]">
            {plan.standby_receivers.map((rec: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] rounded-sm flex items-center justify-between">
                <div>
                  <div className="font-bold">{rec.name}</div>
                  <div className="text-[11px] text-[#4A4D4A]">Window: {rec.window}</div>
                </div>
                <div className="font-mono text-xs font-bold">
                  {rec.capacity} capacity
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
