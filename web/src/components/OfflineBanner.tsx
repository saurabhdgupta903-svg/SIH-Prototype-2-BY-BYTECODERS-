"use client";

import React, { useState, useEffect } from "react";
import { getPendingWasteRecords, clearSyncedRecords } from "../lib/offlineStore";
import { apiRequest } from "../lib/api";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">("idle");

  const checkPending = async () => {
    try {
      const records = await getPendingWasteRecords();
      setPendingCount(records.length);
      return records;
    } catch {
      return [];
    }
  };

  const syncPendingRecords = async () => {
    const records = await checkPending();
    if (records.length === 0) return;

    setSyncStatus("syncing");
    try {
      await apiRequest("/api/waste/batch-sync", {
        method: "POST",
        body: JSON.stringify({
          records: records.map((r) => ({
            kitchen_id: r.kitchen_id,
            food_item_id: r.food_item_id,
            quantity_kg: r.quantity_kg,
            reason: r.reason,
            notes: r.notes,
            client_offline_id: r.client_offline_id,
            recorded_at: r.recorded_at,
          })),
        }),
      });
      await clearSyncedRecords();
      setPendingCount(0);
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 5000);
    } catch (e) {
      console.warn("Sync failed, keeping in local queue:", e);
      setSyncStatus("idle");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    checkPending();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingRecords();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const interval = setInterval(checkPending, 3000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0 && syncStatus !== "synced") {
    return null;
  }

  return (
    <div
      role="alert"
      className={`px-4 py-2 text-[12px] border-b flex items-center justify-between transition-colors ${
        !isOnline
          ? "bg-[#FEF7EE] border-[#B25E00] text-[#B25E00]"
          : syncStatus === "synced"
          ? "bg-[#EBF5EE] border-[#1A6334] text-[#1A6334]"
          : "bg-[#F4F2EC] border-[#CFCABD] text-[#1B1C1A]"
      }`}
    >
      <div className="flex items-center gap-2 font-medium">
        <span
          className={`w-2 h-2 rounded-full inline-block ${
            !isOnline ? "bg-[#B25E00]" : syncStatus === "synced" ? "bg-[#1A6334]" : "bg-[#80868B]"
          }`}
        />
        {!isOnline ? (
          <span>Offline Mode active: Network disconnected. Data will be saved locally.</span>
        ) : syncStatus === "synced" ? (
          <span>Synchronised: All queued records uploaded successfully to central server.</span>
        ) : (
          <span>Network connection active.</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {pendingCount > 0 && (
          <span className="font-mono bg-white px-2 py-0.5 border border-[#CFCABD] rounded-sm text-[#1B1C1A]">
            {pendingCount} {pendingCount === 1 ? "record" : "records"} pending synchronisation
          </span>
        )}
        {isOnline && pendingCount > 0 && syncStatus !== "syncing" && (
          <button
            onClick={syncPendingRecords}
            className="bg-[#1F4D3A] text-white px-2 py-0.5 rounded-sm hover:underline"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
}
