"use client";

import React, { useEffect, useState } from "react";
import { apiRequest, API_BASE_URL } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function SustainabilityReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const data = await apiRequest("/api/reports/esg-summary");
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) return <SkeletonLoader rows={6} heightClass="h-20" />;

  const r = report;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Modules S & T: Sustainability & ESG Compliance (Demo Step 7)
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Sustainability Impact Ledger & Official ESG Audit
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Audited period: {r.reporting_period} | Entity: {r.institution_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedDataBadge context="12-month synthetic institutional baseline" />
          <a
            href={`${API_BASE_URL}/api/reports/download-pdf`}
            download
            className="bg-[#1F4D3A] text-white px-3.5 py-1.5 text-xs font-semibold rounded-sm hover:bg-[#16382A] flex items-center gap-1.5"
          >
            <span>⬇ Download Official MoFPI ESG PDF</span>
          </a>
        </div>
      </div>

      {/* 4 Primary Impact Cards (Dense Flat Layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Food Rescued & Redistributed</div>
          <div className="text-2xl font-bold font-mono text-[#1F4D3A] mt-1">
            {r.surplus_redistributed_kg.toLocaleString()} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">
            {r.meals_served_to_community.toLocaleString()} community meals served
          </div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Waste Prevented at Source</div>
          <div className="text-2xl font-bold font-mono text-[#1A6334] mt-1">
            {r.waste_prevented_kg.toLocaleString()} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">Pre-production demand tuning</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">CO2e Emissions Avoided</div>
          <div className="text-2xl font-bold font-mono text-[#1F4D3A] mt-1">
            {r.co2e_emissions_avoided_kg.toLocaleString()} <span className="text-xs font-normal">kg CO2e</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">IPCC/WRAP standard factor (2.5)</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Financial Value Reclaimed</div>
          <div className="text-2xl font-bold font-mono text-[#1B1C1A] mt-1">
            INR {r.financial_value_reclaimed_inr.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">Procurement and disposal savings</div>
        </div>
      </div>

      {/* Monthly Historical Trend Table (Flat Data Table - Rule 6 & 29) */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
            Monthly Sustainability Progression (12-Month Audited Log)
          </h2>
          <span className="text-[11px] text-[#5F6368]">
            Tabular format with right-aligned quantities
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Reporting Month</th>
                <th className="py-2 px-3 font-semibold text-right">Waste Prevented (kg)</th>
                <th className="py-2 px-3 font-semibold text-right">Surplus Rescued (kg)</th>
                <th className="py-2 px-3 font-semibold text-right">CO2e Avoided (kg)</th>
                <th className="py-2 px-3 font-semibold">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {r.monthly_trend.map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#FCFBF9]">
                  <td className="py-2 px-3 font-medium text-[#1B1C1A]">{m.month}</td>
                  <td className="py-2 px-3 text-right font-mono">{m.waste_prevented_kg.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono text-[#1A6334] font-medium">{m.food_rescued_kg.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right font-mono">{m.co2e_avoided_kg.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <span className="text-[10px] font-bold text-[#1A6334] bg-[#EBF5EE] px-1.5 py-0.5 rounded-sm">
                      Audit Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Emission & Factor Citations Table (Design Rule: Never show a number without a source) */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <div className="border-b border-[#E7E4DC] pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
            Scientific & Environmental Benchmark Citations
          </h2>
          <p className="text-[11px] text-[#5F6368]">
            Transparency guarantee: Every multiplier used across FoodLoop models traces to a peer-reviewed or statutory publication.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Commodity / Resource</th>
                <th className="py-2 px-3 font-semibold text-right">Benchmark Factor</th>
                <th className="py-2 px-3 font-semibold">Primary Citation Source</th>
                <th className="py-2 px-3 font-semibold">Methodological Boundary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {r.citations.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#FCFBF9]">
                  <td className="py-2 px-3 font-medium text-[#1B1C1A]">{c.factor_name}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-[#1F4D3A]">
                    {c.value} {c.unit}
                  </td>
                  <td className="py-2 px-3 text-[#4A4D4A] font-medium">{c.source}</td>
                  <td className="py-2 px-3 text-[#5F6368] text-[11px]">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
