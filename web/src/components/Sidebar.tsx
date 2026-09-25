"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth";
import { useTranslation } from "../lib/i18n";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useTranslation();
  const role = user?.role || "kitchen_manager";

  const navItems = [
    // Kitchen Manager Section
    { href: "/kitchen/dashboard", label: t("navDashboard"), roles: ["admin", "kitchen_manager", "reviewer"], group: "Kitchen" },
    { href: "/kitchen/daily-plan", label: t("navDailyPlan"), roles: ["admin", "kitchen_manager"], group: "Kitchen" },
    { href: "/kitchen/forecast", label: t("navForecast"), roles: ["admin", "kitchen_manager", "reviewer"], group: "Kitchen" },
    { href: "/kitchen/what-if", label: "What-If Planner", roles: ["admin", "kitchen_manager"], group: "Kitchen" },
    { href: "/kitchen/waste/record", label: t("navWasteRecord"), roles: ["admin", "kitchen_manager"], group: "Waste" },
    { href: "/kitchen/waste/analysis", label: t("navWasteAnalysis"), roles: ["admin", "kitchen_manager", "reviewer"], group: "Waste" },
    { href: "/kitchen/surplus", label: t("navSurplus"), roles: ["admin", "kitchen_manager"], group: "Redistribution" },
    { href: "/kitchen/quality", label: t("navQuality"), roles: ["admin", "kitchen_manager"], group: "Redistribution" },
    { href: "/kitchen/procurement", label: t("navProcurement"), roles: ["admin", "kitchen_manager"], group: "Planning" },
    { href: "/kitchen/cost-calculator", label: t("navCostCalculator"), roles: ["admin", "kitchen_manager", "reviewer"], group: "Planning" },

    // Food Processing Unit Section
    { href: "/processing/efficiency", label: "Processing & Yield", roles: ["admin", "fpu_manager", "reviewer"], group: "Processing" },
    { href: "/processing/machines", label: "Machine Monitoring", roles: ["admin", "fpu_manager"], group: "Processing" },
    { href: "/processing/storage", label: "Cold Storage Sensors", roles: ["admin", "fpu_manager", "kitchen_manager"], group: "Processing" },
    { href: "/processing/energy", label: "Energy & Loss", roles: ["admin", "fpu_manager", "reviewer"], group: "Processing" },

    // Receiver Section
    { href: "/receiver/donations", label: "Available Donations", roles: ["admin", "receiver"], group: "Community Receiver" },
    { href: "/receiver/confirm", label: "Delivery Confirmation", roles: ["admin", "receiver"], group: "Community Receiver" },

    // Driver Section
    { href: "/driver/route", label: t("navLogistics"), roles: ["admin", "driver", "kitchen_manager"], group: "Logistics" },

    // Admin & Sustainability
    { href: "/admin/dashboard", label: t("navAdmin"), roles: ["admin", "reviewer"], group: "Governance" },
    { href: "/admin/verification", label: "Receiver Verification", roles: ["admin"], group: "Governance" },
    { href: "/admin/model-metrics", label: "Model Metrics & Drift", roles: ["admin", "reviewer", "kitchen_manager"], group: "Governance" },
    { href: "/kitchen/reports", label: t("navESG"), roles: ["admin", "kitchen_manager", "reviewer", "fpu_manager"], group: "Governance" },
  ];

  // Filter accessible items
  const accessible = navItems.filter((i) => i.roles.includes(role));

  // Group by group name
  const groups: Record<string, typeof accessible> = {};
  accessible.forEach((item) => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  return (
    <aside className="w-64 bg-[#FCFBF9] border-r border-[#CFCABD] p-3 shrink-0 flex flex-col gap-4 select-none min-h-[calc(100vh-140px)]">
      <div className="px-2 py-1 text-[11px] font-semibold tracking-wider uppercase text-[#5F6368] border-b border-[#E7E4DC]">
        Navigation Menu
      </div>

      <nav className="flex-1 space-y-4">
        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} className="space-y-1">
            <div className="px-2 text-[10px] uppercase font-bold tracking-wider text-[#80868B]">
              {groupName}
            </div>
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-2.5 py-1.5 text-[13px] rounded-sm transition-colors border ${
                    active
                      ? "bg-[#1F4D3A] text-white font-medium border-[#1F4D3A]"
                      : "text-[#1B1C1A] hover:bg-[#F4F2EC] border-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Audit Log link */}
      <div className="pt-2 border-t border-[#E7E4DC] text-[11px]">
        <Link
          href="/admin/alerts"
          className="flex items-center justify-between px-2 py-1 text-[#4A4D4A] hover:underline"
        >
          <span>Alerts & Audit Logs</span>
          <span className="font-mono text-[10px] bg-[#E7E4DC] border border-[#CFCABD] px-1 rounded-sm">
            Live
          </span>
        </Link>
      </div>
    </aside>
  );
}
