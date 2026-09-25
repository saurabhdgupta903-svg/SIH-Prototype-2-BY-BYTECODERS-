"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function QualityScreeningPage() {
  const [surplusDetail, setSurplusDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("1234");
  const [approving, setApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState<any>(null);

  const fetchSurplus = async () => {
    try {
      // Fetch demo surplus FL-2026-000182 (surplus ID 1)
      const res = await apiRequest("/api/surplus/1");
      setSurplusDetail(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurplus();
  }, []);

  const handleApproval = async (approved: boolean) => {
    setApproving(true);
    try {
      const res = await apiRequest("/api/surplus/1/approve-quality", {
        method: "POST",
        body: JSON.stringify({
          approved,
          notes: approved
            ? "Sensory inspection verified: steam aroma normal, temperature confirmed >60°C. Approved for Annapoorna Community Kitchen."
            : "Rejected by kitchen supervisor.",
          supervisor_pin: pin,
        }),
      });
      setApprovalResult(res);
      fetchSurplus();
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <SkeletonLoader rows={6} heightClass="h-16" />;

  const s = surplusDetail;
  const qc = s?.quality_check;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module G: Food Safety Assessment (Demo Step 3)
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Surplus Quality Screening & Supervisory Sign-Off
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Two-level safety clearance: deterministic FSSAI holding rules combined with visual risk screening.
          </p>
        </div>
        <SimulatedDataBadge context="Vision risk heuristic & temperature sensor feed" />
      </div>

      {approvalResult && (
        <div className="bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] p-4 rounded-sm text-[13px] flex items-center justify-between">
          <span>
            <b>Clearance Sign-off Recorded:</b> Traceability ID {approvalResult.traceability_id} marked as &apos;{approvalResult.approval_status.toUpperCase()}&apos;. Written to immutable government audit log.
          </span>
          <Link
            href="/kitchen/surplus"
            className="bg-[#1A6334] text-white px-3 py-1 text-xs rounded-sm hover:underline ml-4"
          >
            Proceed to Step 4: Receiver Matching →
          </Link>
        </div>
      )}

      {/* Traceability Header Card */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 text-[13px]">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E7E4DC] gap-2">
          <div>
            <div className="text-[11px] font-mono text-[#5F6368]">Traceability ID</div>
            <div className="font-mono text-base font-bold text-[#1F4D3A]">{s.traceability_id}</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#5F6368]">Food Item</div>
            <div className="font-bold text-[#1B1C1A]">{s.food_item_name}</div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#5F6368]">Portion Count / Mass</div>
            <div className="font-mono font-bold text-[#1B1C1A]">
              {s.estimated_portions} portions ({s.quantity_kg} kg)
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#5F6368]">Holding State</div>
            <div className="font-mono font-bold text-[#1A6334]">{s.storage_temp_c}°C (Hot Holding)</div>
          </div>
        </div>

        {/* Screening Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* Level 1 Rule-Based Evaluation */}
          <div className="p-3 bg-[#FCFBF9] border border-[#CFCABD] rounded-sm space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A] flex items-center justify-between">
              <span>Level 1: Rule Engine (FSSAI Holding Norms)</span>
              <span className="text-[#1A6334] font-mono font-bold">Passed</span>
            </div>
            <div className="text-[12px] space-y-1 text-[#4A4D4A]">
              <div className="flex justify-between">
                <span>Holding Duration:</span>
                <span className="font-mono font-bold">{qc ? qc.holding_hours : 2.8} hours (Limit: 4.0h)</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Temperature:</span>
                <span className="font-mono font-bold">{qc ? qc.storage_temp_c : 63.5}°C (&gt;60°C required)</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging Seal Integrity:</span>
                <span className="font-bold text-[#1A6334]">Intact & Certified</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-[#5F6368] border-t border-[#E7E4DC]">
              Rule check summary: Hot holding verified. Holding time 2.8 hours is safe but approaches 3.0h advisory.
            </div>
          </div>

          {/* Level 2 Vision Risk Assessment */}
          <div className="p-3 bg-[#FCFBF9] border border-[#CFCABD] rounded-sm space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A] flex items-center justify-between">
              <span>Level 2: Visual Risk Assessment</span>
              <span className="bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00] px-1.5 py-0.5 text-[10px] font-bold rounded-sm">
                Verification required
              </span>
            </div>
            <div className="text-[12px] space-y-1 text-[#4A4D4A]">
              <div className="flex justify-between">
                <span>Visual Risk Score:</span>
                <span className="font-mono font-bold">0.38 / 1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Category Output:</span>
                <span className="font-bold text-[#B25E00]">Verification required</span>
              </div>
            </div>
            <div className="pt-2 text-[11px] text-[#5F6368] border-t border-[#E7E4DC]">
              Decision support only: surface texture consistent, but human sensory signoff is mandatory before community delivery release.
            </div>
          </div>
        </div>

        {/* Human Supervisor Release Authorization */}
        <div className="mt-5 p-4 bg-[#F4F2EC] border border-[#CFCABD] rounded-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F4D3A]">
              Authorised Staff Release Sign-Off (Audit Logged)
            </h3>
            <span className="text-[11px] font-mono text-[#5F6368]">
              Current Status: <b>{qc?.approval_status?.toUpperCase() || "PENDING"}</b>
            </span>
          </div>

          <p className="text-[12px] text-[#4A4D4A]">
            In accordance with MoFPI food safety covenants, authorized kitchen staff must enter their security PIN to approve or reject redistribution of this batch.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="supervisor-pin" className="text-xs font-medium">Supervisor PIN:</label>
              <input
                id="supervisor-pin"
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-24 px-2 py-1 border border-[#CFCABD] rounded-sm font-mono text-center text-sm"
              />
            </div>

            <button
              onClick={() => handleApproval(true)}
              disabled={approving || qc?.approval_status === "approved"}
              className="bg-[#1A6334] text-white px-4 py-1.5 text-xs font-bold rounded-sm hover:bg-[#15522A] disabled:opacity-50"
            >
              {approving ? "Recording Audit..." : "✓ Authorize & Approve Batch Release"}
            </button>

            <button
              onClick={() => handleApproval(false)}
              disabled={approving || qc?.approval_status === "approved"}
              className="bg-white border border-[#A51D24] text-[#A51D24] px-4 py-1.5 text-xs font-bold rounded-sm hover:bg-[#FDF2F2] disabled:opacity-50"
            >
              ✕ Reject & Divert to Organic Recycling
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
