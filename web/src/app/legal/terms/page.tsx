import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-[#CFCABD] pb-4">
        <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider">
          Legal & Operational Protocol
        </div>
        <h1 className="text-2xl font-bold text-[#1F4D3A] tracking-tight">
          Terms of Service and Redistribution Covenant
        </h1>
        <p className="text-xs text-[#5F6368] mt-1">
          Ministry of Food Processing Industries (MoFPI) Institutional Standards
        </p>
      </div>

      <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-5 text-[13px] text-[#1B1C1A] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#1F4D3A] uppercase tracking-wide">
            1. Institutional Responsibilities
          </h2>
          <p>
            All participating institutions (universities, hospitals, hotels, canteens, industrial cafeterias) affirm that food logged as surplus has been prepared in accordance with FSSAI sanitary standards and stored at temperatures compliant with cold or hot holding rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#1F4D3A] uppercase tracking-wide">
            2. Safety Screening and Mandatory Sign-off
          </h2>
          <p>
            Algorithmic safety classifications (Level 1 rules and Level 2 vision analysis) provide decision-support only. Under no circumstances does automated classification supersede authorized kitchen supervisory judgement. Every release requires explicit supervisor verification and PIN entry recorded in the immutable audit log.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#1F4D3A] uppercase tracking-wide">
            3. Non-Commercial Covenant for Donated Surplus
          </h2>
          <p>
            Surplus food routed to designated community receivers (NGOs, shelters, food banks, community kitchens) is strictly for charitable, non-commercial human consumption. Commercial secondary market sales are restricted exclusively to certified secondary buyers under separate regulatory covenants.
          </p>
        </section>
      </div>
    </div>
  );
}
