import React from "react";

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-[#CFCABD] pb-4">
        <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider">
          Accessibility Compliance
        </div>
        <h1 className="text-2xl font-bold text-[#1F4D3A] tracking-tight">
          Accessibility Statement (WCAG 2.1 AA)
        </h1>
        <p className="text-xs text-[#5F6368] mt-1">
          Guidelines for Indian Government Websites (GIGW) & W3C WCAG 2.1 Standards
        </p>
      </div>

      <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-5 text-[13px] text-[#1B1C1A] leading-relaxed">
        <p>
          The FoodLoop portal has been engineered to comply with Level AA of the Web Content Accessibility Guidelines (WCAG) 2.1 and GIGW 3.0 standards.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#4A4D4A]">
          <li><b>High-Contrast Palette:</b> All color pairings exceed the 4.5:1 contrast ratio requirement for standard text.</li>
          <li><b>Text Resizing:</b> The utility bar supports text scaling (A-, A, A+) without breaking responsive grid containers.</li>
          <li><b>Keyboard Navigability:</b> All actionable interactive elements, modals, and tables support standard keyboard navigation (Tab, Enter, Space).</li>
          <li><b>Reduced Motion:</b> The portal honors the system-level <code>prefers-reduced-motion</code> setting, disabling animation triggers.</li>
          <li><b>Screen Reader Landmarks:</b> ARIA labels and skip-to-content anchors are integrated across primary sections.</li>
        </ul>
      </div>
    </div>
  );
}
