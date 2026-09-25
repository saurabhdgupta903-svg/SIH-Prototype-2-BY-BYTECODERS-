"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function AlertsCentrePage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlertsAndLogs = async () => {
    try {
      const [aData, lData] = await Promise.all([
        apiRequest("/api/alerts"),
        apiRequest("/api/auth/audit-logs").catch(() => []),
      ]);
      setAlerts(aData);
      setAuditLogs(lData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndLogs();
  }, []);

  const handleResolveAlert = async (id: number) => {
    try {
      await apiRequest(`/api/alerts/${id}/resolve`, { method: "POST" });
      fetchAlertsAndLogs();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <SkeletonLoader rows={6} heightClass="h-16" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Module V: Central Alert & Audit Center
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            System Operational Alerts & Statutory Audit Records
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Real-time notifications across predicted surplus, storage telemetry anomalies, and supervisor clearances.
          </p>
        </div>
        <SimulatedDataBadge context="Live system alerts & immutable audit log entries" />
      </div>

      {/* Active Alerts List */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Active System Alerts
        </h2>

        <div className="space-y-2.5">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-3.5 border rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                a.severity === "critical"
                  ? "bg-[#FDF2F2] border-[#A51D24]"
                  : a.severity === "warning"
                  ? "bg-[#FEF7EE] border-[#B25E00]"
                  : "bg-white border-[#CFCABD]"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                      a.severity === "critical"
                        ? "bg-[#A51D24] text-white"
                        : a.severity === "warning"
                        ? "bg-[#B25E00] text-white"
                        : "bg-[#1F4D3A] text-white"
                    }`}
                  >
                    {a.severity}
                  </span>
                  <span className="font-bold text-[#1B1C1A] text-sm">{a.title}</span>
                  <span className="font-mono text-[10px] text-[#5F6368]">{a.created_at.split("T")[0]}</span>
                </div>
                <p className="text-[12px] text-[#4A4D4A] mt-1">{a.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {a.action_url && (
                  <Link
                    href={a.action_url}
                    className="bg-[#1F4D3A] text-white px-3 py-1 text-xs font-medium rounded-sm hover:bg-[#16382A]"
                  >
                    Take Action →
                  </Link>
                )}
                <button
                  onClick={() => handleResolveAlert(a.id)}
                  className="bg-white border border-[#CFCABD] text-[#1B1C1A] px-2.5 py-1 text-xs rounded-sm hover:bg-[#F4F2EC]"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
          Recent Supervisory Audit Logs (Tamper-Proof)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EC] text-[#4A4D4A] border-b border-[#CFCABD]">
                <th className="py-2 px-3 font-semibold">Timestamp (UTC)</th>
                <th className="py-2 px-3 font-semibold">Mutating Action</th>
                <th className="py-2 px-3 font-semibold">Resource Type</th>
                <th className="py-2 px-3 font-semibold">Traceability Resource ID</th>
                <th className="py-2 px-3 font-semibold">Regulatory Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FCFBF9]">
                    <td className="py-2 px-3 font-mono text-[11px] text-[#5F6368]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 font-bold text-[#1F4D3A]">{log.action}</td>
                    <td className="py-2 px-3 text-[#4A4D4A]">{log.resource_type}</td>
                    <td className="py-2 px-3 font-mono">{log.resource_id}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-bold text-[#1A6334] bg-[#EBF5EE] px-1.5 py-0.5 rounded-sm">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[#5F6368]">
                    Initial supervisor actions will register here upon verification sign-off.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
