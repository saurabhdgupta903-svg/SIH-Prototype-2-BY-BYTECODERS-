"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";

export default function ReceiverConfirmPage() {
  const [portions, setPortions] = useState("45");
  const [tempVerified, setTempVerified] = useState("62.5");
  const [notes, setNotes] = useState("Received in optimal thermal state. Temperature verified at 62.5°C.");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest("/api/logistics/confirm-delivery", {
        method: "POST",
        body: JSON.stringify({
          surplus_id: 1,
          portions_received: parseInt(portions) || 45,
          notes,
        }),
      });
      setConfirmed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module L: Receiver Handover Confirmation
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Digital Delivery Receipt & Verification
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Traceability ID: FL-2026-000182 | Destination: Annapoorna Community Kitchen
          </p>
        </div>
        <SimulatedDataBadge context="Digital receipt confirmation workflow" />
      </div>

      {confirmed ? (
        <div className="bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] p-5 rounded-sm text-[13px] space-y-3">
          <div className="font-bold text-base">
            ✓ Digital Handover Confirmed & Signed
          </div>
          <p>
            Receipt of {portions} meals confirmed. Chain of custody is closed, and impact savings (CO2e, landfill diversion, financial value) have been immediately credited to the regional sustainability ledger.
          </p>
          <div className="pt-2">
            <Link
              href="/kitchen/reports"
              className="bg-[#1A6334] text-white px-4 py-1.5 text-xs font-semibold rounded-sm hover:underline inline-block"
            >
              View Updated Impact Dashboard & ESG Report →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
            <div>
              <label className="block font-medium mb-1">Confirmed Portions Received</label>
              <input
                type="number"
                required
                value={portions}
                onChange={(e) => setPortions(e.target.value)}
                className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
              <span className="text-[10px] text-[#5F6368]">Dispatched portion quantity: 45 meals</span>
            </div>

            <div>
              <label className="block font-medium mb-1">Receipt Arrival Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                required
                value={tempVerified}
                onChange={(e) => setTempVerified(e.target.value)}
                className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              />
              <span className="text-[10px] text-[#5F6368]">Must exceed 60°C for hot food holding</span>
            </div>

            <div>
              <label className="block font-medium mb-1">Receiver Intake Remarks</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm text-[13px]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1F4D3A] text-white py-2.5 font-semibold rounded-sm hover:bg-[#16382A] disabled:opacity-50"
            >
              {submitting ? "Signing Handover..." : "Confirm Receipt & Sign Digital Handover"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
