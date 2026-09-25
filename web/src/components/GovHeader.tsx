"use client";

import React from "react";
import Link from "next/link";
import { useAuth, User } from "../lib/auth";
import { useTranslation } from "../lib/i18n";

export function GovHeader() {
  const { user, switchRoleDemo } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="bg-[#1F4D3A] text-white border-b-2 border-[#16382A] px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Ministry & Brand Identification */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white border border-[#CFCABD] rounded-sm flex items-center justify-center p-1">
            {/* National Ashoka Lion Capital stylized SVG representation */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#1F4D3A] fill-current">
              <path d="M12 2 L15 7 L21 7 L17 11 L19 17 L12 14 L5 17 L7 11 L3 7 L9 7 Z" />
              <rect x="7" y="18" width="10" height="2" />
              <rect x="9" y="21" width="6" height="1.5" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xl font-bold tracking-tight text-white hover:underline">
                FoodLoop
              </Link>
              <span className="text-[11px] bg-[#16382A] border border-[#2B684F] text-[#F4F2EC] px-1.5 py-0.5 rounded-sm font-mono">
                SIH26234
              </span>
            </div>
            <div className="text-[11px] text-[#CFCABD] tracking-wide">
              Ministry of Food Processing Industries (MoFPI) | Smart India Hackathon 2026
            </div>
          </div>
        </div>

        {/* User Role Switcher for Hackathon Demonstrations */}
        <div className="flex items-center gap-3 bg-[#16382A] border border-[#2B684F] px-3 py-1.5 rounded-sm">
          <div className="text-left text-[11px]">
            <div className="text-[#CFCABD]">Active User Role:</div>
            <div className="font-semibold text-white truncate max-w-[200px]">
              {user ? user.full_name : "Guest"}
            </div>
          </div>

          <div className="border-l border-[#2B684F] pl-2.5">
            <label htmlFor="role-select" className="sr-only">Switch Demo Role</label>
            <select
              id="role-select"
              value={user?.role || "kitchen_manager"}
              onChange={(e) => switchRoleDemo(e.target.value as User["role"])}
              className="bg-[#1F4D3A] text-white text-[12px] border border-[#CFCABD] px-2 py-1 rounded-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-white"
            >
              <option value="kitchen_manager">Kitchen Manager</option>
              <option value="admin">Admin (MoFPI Director)</option>
              <option value="fpu_manager">Food Processing Unit Manager</option>
              <option value="receiver">Receiver (NGO / Shelter)</option>
              <option value="driver">Logistics Driver</option>
              <option value="reviewer">Government Reviewer</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
