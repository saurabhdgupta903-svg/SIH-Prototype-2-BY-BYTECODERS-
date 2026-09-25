import React from "react";
import Link from "next/link";

export function GovFooter() {
  return (
    <footer className="bg-[#E7E4DC] border-t border-[#CFCABD] text-[#1B1C1A] text-[12px] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="font-bold text-[#1F4D3A] text-sm mb-2">FoodLoop Platform</div>
            <p className="text-[#5F6368] leading-relaxed">
              Smart Food Waste Reduction and Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units.
            </p>
            <div className="mt-2 text-[11px] font-mono text-[#4A4D4A]">
              Problem Statement: SIH26234
            </div>
          </div>

          <div>
            <div className="font-bold text-[#1F4D3A] text-sm mb-2">Statutory Legal Framework</div>
            <ul className="space-y-1.5 text-[#4A4D4A]">
              <li>
                <Link href="/legal/privacy" className="hover:underline hover:text-[#1F4D3A]">
                  Privacy Policy (DPDP Act 2023)
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:underline hover:text-[#1F4D3A]">
                  Terms of Service & Data Usage
                </Link>
              </li>
              <li>
                <Link href="/legal/accessibility" className="hover:underline hover:text-[#1F4D3A]">
                  Accessibility Statement (WCAG 2.1 AA)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-[#1F4D3A] text-sm mb-2">Public Grievance & Nodal Office</div>
            <ul className="space-y-1.5 text-[#4A4D4A]">
              <li>
                <Link href="/legal/grievance" className="hover:underline hover:text-[#1F4D3A]">
                  Grievance Redressal Mechanism
                </Link>
              </li>
              <li>
                <span className="text-[#5F6368]">Nodal Officer:</span> Sh. Arvind Sharma
              </li>
              <li>
                <span className="text-[#5F6368]">Email:</span> nodal-officer@foodloop.gov.in
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-[#1F4D3A] text-sm mb-2">Standards & Environmental Norms</div>
            <ul className="space-y-1 text-[#5F6368]">
              <li>CEA Baseline Emission Factors (v19)</li>
              <li>IPCC Food Waste Avoidance Metrics</li>
              <li>FAO Aquastat Resource Efficiency Guidelines</li>
              <li>FSSAI Safe Food Holding Parameters</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#CFCABD] pt-4 flex flex-col sm:flex-row items-center justify-between text-[#5F6368] text-[11px] gap-2">
          <div>
            © 2026 Ministry of Food Processing Industries (MoFPI), Government of India. Designed for official institutional use.
          </div>
          <div className="flex items-center gap-3">
            <span>Server Time: 2026-09-23 UTC</span>
            <span>Version: 1.0.0-PROD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
