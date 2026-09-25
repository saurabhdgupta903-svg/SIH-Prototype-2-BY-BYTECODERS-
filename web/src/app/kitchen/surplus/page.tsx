"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function SurplusMatchingPage() {
  const router = useRouter();
  const [surplusDetail, setSurplusDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(null);
  const [matchingSubmitting, setMatchingSubmitting] = useState(false);
  const [matchedSuccess, setMatchedSuccess] = useState(false);

  const fetchSurplus = async () => {
    try {
      const res = await apiRequest("/api/surplus/1");
      setSurplusDetail(res);
      if (res.matches && res.matches.length > 0) {
        setSelectedReceiverId(res.matches[0].receiver_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurplus();
  }, []);

  const handleSelectMatch = async (receiverId: number) => {
    setMatchingSubmitting(true);
    try {
      // Step 4 in 5-minute demo: select best match and generate route
      await apiRequest("/api/logistics/optimize-route", {
        method: "POST",
        body: JSON.stringify({
          surplus_id: surplusDetail.id,
          receiver_id: receiverId,
          include_secondary_stop: false,
        }),
      });
      setMatchedSuccess(true);
      setTimeout(() => router.push("/driver/route"), 1200);
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setMatchingSubmitting(false);
    }
  };

  if (loading) return <SkeletonLoader rows={6} heightClass="h-16" />;

  const s = surplusDetail;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Modules H, I & J: Surplus Listing & Multi-Criteria Matching (Demo Step 4)
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Automated Receiver Scoring & Recovery Dispatch
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Multi-factor weighted evaluation: compatibility, portion capacity, real OSRM road distance, and community urgency.
          </p>
        </div>
        <SimulatedDataBadge context="OSM Overpass candidates + OSRM distance matrix" />
      </div>

      {matchedSuccess && (
        <div className="bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] p-4 rounded-sm text-[13px] flex items-center justify-between">
          <span>
            <b>Match Finalized & Route Dispatched:</b> Driver assigned (Vehicle MH-12-FL-2026). Redirecting to real-time live map tracking...
          </span>
          <Link
            href="/driver/route"
            className="bg-[#1A6334] text-white px-3 py-1 text-xs rounded-sm hover:underline ml-4"
          >
            Go to Live Tracking →
          </Link>
        </div>
      )}

      {/* Surplus Batch Summary Card */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 text-[13px]">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E7E4DC] gap-3">
          <div>
            <span className="text-[11px] font-mono text-[#5F6368]">Traceability ID:</span>
            <div className="font-mono text-base font-bold text-[#1F4D3A]">{s.traceability_id}</div>
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#5F6368]">Portions / Mass:</span>
            <div className="font-mono font-bold text-[#1B1C1A]">
              {s.estimated_portions} portions ({s.quantity_kg} kg)
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#5F6368]">Recommended Hierarchy:</span>
            <div className="font-bold text-[#1A6334] uppercase text-xs">
              {s.recommended_recovery_path.replace("_", " ")}
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#5F6368]">Safety Approval:</span>
            <div className="font-mono font-bold text-[#1A6334]">
              {s.quality_check?.approval_status?.toUpperCase() || "PENDING"}
            </div>
          </div>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-between text-[12px] text-[#4A4D4A]">
          <div>
            <b>Safe Holding Window:</b> {new Date(s.safe_pickup_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(s.safe_pickup_window_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div>
            <b>Dispatch Location:</b> Sahyadri Central Mega Kitchen, Shivajinagar, Pune
          </div>
        </div>
      </div>

      {/* Receiver Matching Scored Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              Candidate Receivers Scored by Multi-Factor Algorithm
            </h2>
            <p className="text-[11px] text-[#5F6368]">
              Hard filters applied (operating hours, safe pickup window, cold chain). Ranked by composite suitability score (0-100).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {s.matches && s.matches.map((m: any, idx: number) => {
            const isSelected = selectedReceiverId === m.receiver_id;
            return (
              <div
                key={m.receiver_id}
                onClick={() => setSelectedReceiverId(m.receiver_id)}
                className={`p-3.5 border rounded-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#FCFBF9] border-[#1F4D3A] ring-1 ring-[#1F4D3A]"
                    : "bg-white border-[#CFCABD] hover:bg-[#F4F2EC]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E7E4DC]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1B1C1A] text-sm">{m.receiver_name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#E7E4DC] rounded-sm text-[#4A4D4A]">
                        {m.receiver_type.replace("_", " ")}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-[#1A6334] bg-[#EBF5EE] border border-[#1A6334] px-1.5 py-0.5 rounded-sm">
                          Top Algorithmic Match
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#5F6368] mt-0.5">{m.address}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-[#5F6368]">Composite Score</div>
                      <div className="text-lg font-bold font-mono text-[#1F4D3A]">
                        {m.overall_score} <span className="text-xs font-normal">/ 100</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectMatch(m.receiver_id);
                      }}
                      disabled={matchingSubmitting}
                      className="bg-[#1F4D3A] text-white px-3 py-1.5 text-xs font-semibold rounded-sm hover:bg-[#16382A] disabled:opacity-50"
                    >
                      {matchingSubmitting && isSelected ? "Routing..." : "Confirm & Route →"}
                    </button>
                  </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-[#5F6368]">
                  <div>
                    <span>Compatibility:</span>{" "}
                    <b className="font-mono text-[#1B1C1A]">{m.food_compatibility_score}/25</b>
                  </div>
                  <div>
                    <span>Quantity Fit:</span>{" "}
                    <b className="font-mono text-[#1B1C1A]">{m.quantity_fit_score}/25</b>
                  </div>
                  <div>
                    <span>Road Distance (OSRM):</span>{" "}
                    <b className="font-mono text-[#1B1C1A]">{m.distance_km} km ({m.eta_minutes}m)</b>
                  </div>
                  <div>
                    <span>Community Priority:</span>{" "}
                    <b className="font-mono text-[#1B1C1A]">{m.urgency_score}/25</b>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#4A4D4A]">
                  <b>Algorithmic Justification:</b> {m.plain_language_reason}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
