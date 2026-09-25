"use client";

import React, { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function ReceiverVerificationPage() {
  const [receivers, setReceivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchReceivers = async () => {
    try {
      const res = await apiRequest("/api/external/receivers");
      setReceivers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivers();
  }, []);

  const handleToggleVerification = async (receiverId: number, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/external/verify-receiver/${receiverId}?verified=${!currentStatus}`, {
        method: "POST",
      });
      setStatusMsg(`Receiver ${receiverId} verification status set to ${!currentStatus}.`);
      fetchReceivers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiscoverOverpass = async () => {
    setDiscovering(true);
    setStatusMsg(null);
    try {
      const res = await apiRequest("/api/external/discover-receivers");
      setStatusMsg(`Discovered ${res.count} facilities near demo coordinates via OpenStreetMap Overpass API. Imported with 'verified: no'.`);
      fetchReceivers();
    } catch (err) {
      console.error(err);
    } finally {
      setDiscovering(false);
    }
  };

  if (loading) return <SkeletonLoader rows={6} heightClass="h-16" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module U: Receiver Compliance & Verification
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            Community Receiver Verification Portal
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Enforces strict regulatory verification for food banks and shelters discovered via OpenStreetMap Overpass API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedDataBadge context="OSM Overpass automated discovery feed" />
          <button
            onClick={handleDiscoverOverpass}
            disabled={discovering}
            className="bg-[#1F4D3A] text-white px-3 py-1.5 text-xs font-semibold rounded-sm hover:bg-[#16382A] disabled:opacity-50"
          >
            {discovering ? "Querying Overpass API..." : "Discover Nearby via Overpass API"}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] p-3 rounded-sm text-[12px]">
          {statusMsg}
        </div>
      )}

      {/* Receiver Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Registered & Discovered Community Receivers
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Receiver Name</th>
                <th className="py-2 px-3 font-semibold">Type</th>
                <th className="py-2 px-3 font-semibold">Source</th>
                <th className="py-2 px-3 font-semibold text-right">Intake Capacity</th>
                <th className="py-2 px-3 font-semibold">Cold Storage</th>
                <th className="py-2 px-3 font-semibold">Verification State</th>
                <th className="py-2 px-3 font-semibold text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {receivers.map((r) => (
                <tr key={r.id} className="hover:bg-[#FCFBF9]">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-[#1B1C1A]">{r.name}</div>
                    <div className="text-[11px] text-[#5F6368]">{r.address}, {r.city}</div>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-[#4A4D4A]">{r.receiver_type.replace("_", " ")}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#5F6368]">{r.source}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{r.capacity_meals} meals</td>
                  <td className="py-2.5 px-3">
                    <span className={r.has_cold_storage ? "text-[#1A6334] font-medium" : "text-[#5F6368]"}>
                      {r.has_cold_storage ? "Available" : "None"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                        r.is_verified
                          ? "bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334]"
                          : "bg-[#FEF7EE] border border-[#B25E00] text-[#B25E00]"
                      }`}
                    >
                      {r.is_verified ? "Verified: Yes" : "Verified: No (Unverified)"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleVerification(r.id, r.is_verified)}
                      className={`px-2.5 py-1 text-xs rounded-sm border font-medium ${
                        r.is_verified
                          ? "bg-white border-[#A51D24] text-[#A51D24] hover:bg-[#FDF2F2]"
                          : "bg-[#1A6334] text-white border-[#1A6334] hover:bg-[#15522A]"
                      }`}
                    >
                      {r.is_verified ? "Revoke Verification" : "Authorize & Verify"}
                    </button>
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
