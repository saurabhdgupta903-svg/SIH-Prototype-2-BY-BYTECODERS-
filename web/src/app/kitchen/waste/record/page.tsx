"use client";

import React, { useState } from "react";
import { apiRequest } from "../../../../lib/api";
import { saveOfflineWasteRecord } from "../../../../lib/offlineStore";
import { SimulatedDataBadge } from "../../../../components/SimulatedDataBadge";

export default function RecordWastePage() {
  const [foodItemId, setFoodItemId] = useState(1);
  const [quantityKg, setQuantityKg] = useState("12.5");
  const [reason, setReason] = useState("overproduction");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [classifiedBadge, setClassifiedBadge] = useState<string | null>(null);

  // Auto-classify notes
  const handleNotesChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    if (val.length > 5) {
      try {
        const res = await apiRequest("/api/waste/classify-note", {
          method: "POST",
          body: JSON.stringify({ note: val }),
        });
        if (res && res.classified_reason) {
          setReason(res.classified_reason);
          setClassifiedBadge(`Auto-classified: ${res.classified_reason}`);
        }
      } catch {
        // Offline heuristic fallback
        if (val.toLowerCase().includes("burnt") || val.toLowerCase().includes("peel")) {
          setReason("preparation_waste");
          setClassifiedBadge("Auto-classified (Local): preparation_waste");
        } else if (val.toLowerCase().includes("sour") || val.toLowerCase().includes("spoil")) {
          setReason("spoilage");
          setClassifiedBadge("Auto-classified (Local): spoilage");
        }
      }
    } else {
      setClassifiedBadge(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    const clientOfflineId = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const parsedKg = parseFloat(quantityKg) || 0;

    // Try online submission first
    try {
      if (typeof window !== "undefined" && !navigator.onLine) {
        throw new Error("Device is offline");
      }

      await apiRequest("/api/waste/record", {
        method: "POST",
        body: JSON.stringify({
          kitchen_id: 1,
          food_item_id: foodItemId,
          quantity_kg: parsedKg,
          reason,
          notes,
          photo_url: photoUrl || null,
          client_offline_id: clientOfflineId,
          recorded_at: new Date().toISOString(),
        }),
      });

      setStatusMessage("Record successfully synchronized with central database.");
      setNotes("");
      setQuantityKg("");
      setClassifiedBadge(null);
    } catch {
      // Save locally to IndexedDB offline queue
      await saveOfflineWasteRecord({
        client_offline_id: clientOfflineId,
        kitchen_id: 1,
        food_item_id: foodItemId,
        food_item_name: foodItemId === 1 ? "Cooked Rice" : foodItemId === 2 ? "Vegetable Curry" : "Dal",
        quantity_kg: parsedKg,
        reason,
        notes,
        recorded_at: new Date().toISOString(),
      });

      setStatusMessage("Network unreachable. Record saved locally to offline queue. It will automatically synchronize when network is restored.");
      setNotes("");
      setQuantityKg("");
      setClassifiedBadge(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module E: Waste Recording
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Log Institutional Kitchen Waste
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Offline-first enabled: records queue automatically in local IndexedDB during field connectivity drops.
          </p>
        </div>
        <SimulatedDataBadge context="Field operator logging interface" />
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-sm text-[12px] border ${
            statusMessage.includes("locally")
              ? "bg-[#FEF7EE] border-[#B25E00] text-[#B25E00]"
              : "bg-[#EBF5EE] border-[#1A6334] text-[#1A6334]"
          }`}
        >
          {statusMessage}
        </div>
      )}

      <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium mb-1">Food Item Category</label>
            <select
              value={foodItemId}
              onChange={(e) => setFoodItemId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm text-[13px]"
            >
              <option value={1}>Cooked Basmati / Kolam Rice (Grains)</option>
              <option value={2}>Mixed Seasonal Vegetable Curry (Vegetables)</option>
              <option value={3}>Whole Wheat Chapati / Roti (Grains)</option>
              <option value={4}>Toor Dal Tadka (Pulses)</option>
              <option value={5}>Fresh Chilled Curd (Dairy)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Waste Mass (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
              placeholder="e.g. 14.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium">Waste Reason Classification</label>
              {classifiedBadge && (
                <span className="text-[11px] font-mono text-[#1A6334] bg-[#EBF5EE] px-1.5 py-0.5 rounded-sm">
                  {classifiedBadge}
                </span>
              )}
            </div>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm text-[13px]"
            >
              <option value="overproduction">Overproduction (Excess batch prepared)</option>
              <option value="spoilage">Spoilage (Curdled, sour, organoleptic failure)</option>
              <option value="expiry">Expiry (Past safe holding date)</option>
              <option value="preparation_waste">Preparation Waste (Peeling, trimming, burnt scrap)</option>
              <option value="storage_issue">Storage Issue (Chiller breakdown, cold room temperature drift)</option>
              <option value="low_demand">Low Demand (Unannounced campus absence, rainy day drop)</option>
              <option value="plate_waste">Plate Waste (Consumer dining hall scraps)</option>
              <option value="equipment_issue">Equipment Issue (Steamer / oven breakdown)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Operator Observations & Notes (Natural Language)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={handleNotesChange}
              placeholder="Type free-text notes (e.g. '15 kg rice remained after dinner shift due to unannounced holiday attendance drop'). The built-in classifier maps this automatically."
              className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm text-[13px]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Photo Verification (Optional URL or File Attachment)</label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... (or leave blank for physical observation log)"
              className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1F4D3A] text-white py-2.5 font-medium rounded-sm hover:bg-[#16382A]"
          >
            {submitting ? "Logging Waste Record..." : "Submit Waste Entry (Offline-Capable)"}
          </button>
        </form>
      </div>
    </div>
  );
}
