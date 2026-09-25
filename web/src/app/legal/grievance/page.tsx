import React from "react";

export default function GrievancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-[#CFCABD] pb-4">
        <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider">
          Public Redressal & Transparency
        </div>
        <h1 className="text-2xl font-bold text-[#1F4D3A] tracking-tight">
          Grievance Redressal and Contact Details
        </h1>
        <p className="text-xs text-[#5F6368] mt-1">
          Ministry of Food Processing Industries (MoFPI) Nodal Office
        </p>
      </div>

      <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-5 text-[13px] text-[#1B1C1A] leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#CFCABD] p-4 rounded-sm bg-[#FCFBF9]">
            <h3 className="font-bold text-sm text-[#1F4D3A] mb-2">Designated Grievance Officer</h3>
            <p className="text-[#4A4D4A]">
              <b>Dr. Arvind Sharma</b><br />
              Joint Director & Nodal Officer (SIH26234)<br />
              Ministry of Food Processing Industries<br />
              Panchsheel Bhawan, August Kranti Marg<br />
              New Delhi 110049<br />
              <b>Email:</b> grievance@foodloop.mofpi.gov.in<br />
              <b>Helpline:</b> +91 11 2649 2216
            </p>
          </div>

          <div className="border border-[#CFCABD] p-4 rounded-sm bg-[#FCFBF9]">
            <h3 className="font-bold text-sm text-[#1F4D3A] mb-2">Regional Maharashtra Hub</h3>
            <p className="text-[#4A4D4A]">
              <b>Smt. Sunita Patil</b><br />
              Regional Coordinator (Western Zone)<br />
              Sahyadri Institutional Hub<br />
              Shivajinagar, Pune 411016<br />
              <b>Email:</b> pune.hub@foodloop.gov.in<br />
              <b>Phone:</b> +91 20 2550 4411
            </p>
          </div>
        </div>

        <div className="border-t border-[#E7E4DC] pt-4">
          <h3 className="font-bold text-sm text-[#1F4D3A] mb-2">Escalation and Response Timelines</h3>
          <p className="text-[#4A4D4A]">
            In accordance with citizen charter standards, institutional grievances regarding redistribution matching discrepancies, sensor telemetry faults, or data correction will be acknowledged within 24 business hours and resolved within 7 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
