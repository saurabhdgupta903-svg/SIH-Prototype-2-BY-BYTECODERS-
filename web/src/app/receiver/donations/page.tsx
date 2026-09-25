"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function ReceiverDonationsPage() {
  const [surplusList, setSurplusList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedId, setAcceptedId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest("/api/surplus/list");
        setSurplusList(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAccept = (id: number) => {
    setAcceptedId(id);
  };

  if (loading) return <SkeletonLoader rows={5} heightClass="h-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Community Receiver Portal
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Incoming Surplus Food Offerings & Scheduled Pickups
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Receiver: Annapoorna Community Kitchen Pune (Verified Node) | Intake Capacity: 350 meals
          </p>
        </div>
        <SimulatedDataBadge context="Algorithmic matches based on dietary intake capacity" />
      </div>

      {acceptedId && (
        <div className="bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] p-4 rounded-sm text-[13px] flex items-center justify-between">
          <span>
            <b>Offering Accepted:</b> Dispatch confirmed for delivery via electric logistics van (MH-12-FL-2026).
          </span>
          <Link
            href="/receiver/confirm"
            className="bg-[#1A6334] text-white px-3 py-1 text-xs rounded-sm hover:underline ml-4"
          >
            Go to Confirmation Form →
          </Link>
        </div>
      )}

      {/* Available Offerings List */}
      <div className="space-y-3">
        {surplusList.map((item) => (
          <div key={item.id} className="bg-white border border-[#CFCABD] rounded-sm p-4 text-[13px] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E7E4DC]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1B1C1A] text-base">{item.food_name}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 bg-[#E7E4DC] text-[#4A4D4A] rounded-sm">
                    {item.traceability_id}
                  </span>
                  <span className="text-[10px] font-bold text-[#1A6334] bg-[#EBF5EE] px-1.5 py-0.5 rounded-sm">
                    Safety Cleared
                  </span>
                </div>
                <div className="text-[12px] text-[#5F6368] mt-0.5">{item.description}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-[#5F6368]">Portions / Mass</div>
                  <div className="text-base font-bold font-mono text-[#1F4D3A]">
                    {item.estimated_portions} meals ({item.quantity_kg} kg)
                  </div>
                </div>

                <button
                  onClick={() => handleAccept(item.id)}
                  disabled={acceptedId === item.id}
                  className="bg-[#1F4D3A] text-white px-4 py-1.5 text-xs font-semibold rounded-sm hover:bg-[#16382A] disabled:opacity-50"
                >
                  {acceptedId === item.id ? "✓ Accepted" : "Accept Offering"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#4A4D4A]">
              <div>
                <span className="text-[#5F6368]">Safe Pickup Window:</span>{" "}
                <b className="font-mono text-[#1B1C1A]">{item.safe_window}</b>
              </div>
              <div>
                <span className="text-[#5F6368]">Holding Temperature:</span>{" "}
                <b className="font-mono text-[#1B1C1A]">{item.storage_temp_c}°C (Compliant)</b>
              </div>
              <div>
                <span className="text-[#5F6368]">Dispatch Kitchen:</span>{" "}
                <span className="font-medium text-[#1B1C1A]">Sahyadri Central Kitchen</span>
              </div>
              <div>
                <span className="text-[#5F6368]">Transit Distance:</span>{" "}
                <span className="font-mono font-bold text-[#1B1C1A]">2.8 km (OSRM Road)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
