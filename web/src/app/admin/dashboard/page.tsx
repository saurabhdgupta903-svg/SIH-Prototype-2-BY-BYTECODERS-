"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import { MapView } from "../../../components/MapView";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function AdminDashboardPage() {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("Pune Metropolitan Region");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest("/api/reports/admin-regional");
        setAdminData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (!adminData) return;
    const rows = [
      ["Facility Name", "City", "Type", "Waste This Week (kg)", "WoW Change (%)", "Status"],
      ...adminData.institutions.map((i: any) => [
        i.name, i.city, i.type, i.waste_this_week_kg, i.change_pct, i.status
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FoodLoop_Regional_Compliance_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <SkeletonLoader rows={6} heightClass="h-20" />;

  const d = adminData;
  const currentRegion = d.regions.find((r: any) => r.region_name === selectedRegion) || d.regions[0];

  const regionalMarkers = d.regions.map((reg: any, idx: number) => ({
    id: idx,
    lat: reg.center[0],
    lng: reg.center[1],
    title: `${reg.region_name} (${reg.institutions_count} Inst)`,
    label: `${reg.tonnes_rescued} t rescued`,
    type: "receiver" as const
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module U: Government Reviewer & Oversight Dashboard
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Regional Food Waste & Redistribution Regulatory Overview
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            State of Maharashtra Hub (Mumbai, Pune, Nashik, Nagpur Cluster Nodes)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedDataBadge context="Regional multi-institutional state data" />
          <button
            onClick={handleExportCSV}
            className="bg-white border border-[#CFCABD] text-[#1B1C1A] px-3 py-1.5 text-xs font-semibold rounded-sm hover:bg-[#F4F2EC]"
          >
            Export Compliance CSV
          </button>
        </div>
      </div>

      {/* 4 State-Level KPI Panels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">State Connected Facilities</div>
          <div className="text-2xl font-bold font-mono text-[#1F4D3A] mt-1">
            {d.total_institutions} <span className="text-xs font-normal">entities</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">{d.total_active_kitchens} active mega kitchens</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Total Food Rescued</div>
          <div className="text-2xl font-bold font-mono text-[#1A6334] mt-1">
            {d.total_tonnes_rescued.toFixed(2)} <span className="text-xs font-normal">tonnes</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">{d.total_receivers} verified receivers</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Source Waste Prevented</div>
          <div className="text-2xl font-bold font-mono text-[#1F4D3A] mt-1">
            {d.total_waste_prevented_tonnes.toFixed(2)} <span className="text-xs font-normal">tonnes</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">Through predictive demand batching</div>
        </div>

        <div className="bg-white border border-[#CFCABD] p-3.5 rounded-sm">
          <div className="text-[11px] text-[#5F6368] font-medium">Net CO2e Emissions Avoided</div>
          <div className="text-2xl font-bold font-mono text-[#1F4D3A] mt-1">
            {d.total_co2e_avoided_tonnes.toFixed(1)} <span className="text-xs font-normal">tonnes</span>
          </div>
          <div className="text-[10px] text-[#80868B] mt-0.5">IPCC AR6 methane factor certified</div>
        </div>
      </div>

      {/* Split: Clustered Regional Map & Drilldown Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              Regional Distribution Nodes (OpenStreetMap Clustered Markers)
            </h2>
            <span className="text-[11px] text-[#5F6368]">Click node to inspect regional metrics</span>
          </div>

          <MapView
            center={[19.2, 75.0]}
            zoom={7}
            markers={regionalMarkers}
            height="380px"
          />

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {d.regions.map((reg: any) => (
              <button
                key={reg.region_name}
                onClick={() => setSelectedRegion(reg.region_name)}
                className={`px-3 py-1 text-xs rounded-sm border ${
                  selectedRegion === reg.region_name
                    ? "bg-[#1F4D3A] text-white border-[#1F4D3A] font-bold"
                    : "bg-white border-[#CFCABD] text-[#1B1C1A] hover:bg-[#F4F2EC]"
                }`}
              >
                {reg.region_name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Region Drilldown Card */}
        <div className="space-y-4">
          <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
            <div className="border-b border-[#E7E4DC] pb-2">
              <span className="text-[10px] font-mono uppercase text-[#5F6368]">Selected Region Drilldown</span>
              <h3 className="font-bold text-sm text-[#1F4D3A]">{currentRegion.region_name}</h3>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between py-1 border-b border-[#E7E4DC]">
                <span className="text-[#5F6368]">Registered Institutions:</span>
                <span className="font-mono font-bold">{currentRegion.institutions_count}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E4DC]">
                <span className="text-[#5F6368]">Active Mega Kitchens:</span>
                <span className="font-mono font-bold">{currentRegion.active_kitchens}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E4DC]">
                <span className="text-[#5F6368]">Food Rescued:</span>
                <span className="font-mono font-bold text-[#1A6334]">{currentRegion.tonnes_rescued} tonnes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E4DC]">
                <span className="text-[#5F6368]">Waste Prevented:</span>
                <span className="font-mono font-bold">{currentRegion.waste_prevented_tonnes} tonnes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E4DC]">
                <span className="text-[#5F6368]">Carbon Avoidance:</span>
                <span className="font-mono font-bold">{currentRegion.co2e_avoided_tonnes} t CO2e</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5F6368]">Regional Trend:</span>
                <span className={`font-bold ${currentRegion.trend === "rising_waste" ? "text-[#A51D24]" : "text-[#1A6334]"}`}>
                  {currentRegion.trend === "rising_waste" ? "Attention Required (Rising)" : "Optimal (Declining Waste)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Oversight Table: Institutions with Rising Waste Flags */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              Facility Compliance Monitoring & Rising Waste Detection
            </h2>
            <p className="text-[11px] text-[#5F6368]">
              Automated anomaly triggers flag institutions with week-over-week waste increases exceeding 10%.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Institutional Facility</th>
                <th className="py-2 px-3 font-semibold">District</th>
                <th className="py-2 px-3 font-semibold">Category</th>
                <th className="py-2 px-3 font-semibold text-right">Waste This Week</th>
                <th className="py-2 px-3 font-semibold text-right">Week-over-Week Change</th>
                <th className="py-2 px-3 font-semibold">Regulatory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {d.institutions.map((inst: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#FCFBF9]">
                  <td className="py-2.5 px-3 font-medium text-[#1B1C1A]">{inst.name}</td>
                  <td className="py-2.5 px-3 text-[#5F6368]">{inst.city}</td>
                  <td className="py-2.5 px-3 text-[#5F6368]">{inst.type}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{inst.waste_this_week_kg} kg</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    <span className={inst.change_pct > 0 ? "text-[#A51D24]" : "text-[#1A6334]"}>
                      {inst.change_pct > 0 ? `+${inst.change_pct}%` : `${inst.change_pct}%`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                        inst.status.includes("Rising")
                          ? "bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24]"
                          : "bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334]"
                      }`}
                    >
                      {inst.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
