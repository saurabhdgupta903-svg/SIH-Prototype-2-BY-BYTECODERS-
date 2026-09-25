import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-[#CFCABD] pb-4">
        <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider">
          Legal & Compliance
        </div>
        <h1 className="text-2xl font-bold text-[#1F4D3A] tracking-tight">
          Privacy Policy & Data Protection Charter
        </h1>
        <p className="text-xs text-[#5F6368] mt-1">
          In strict compliance with India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act 2023)
        </p>
      </div>

      <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-5 text-[13px] text-[#1B1C1A] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#1F4D3A] uppercase tracking-wide">
            1. Statutory Framework and Applicability
          </h2>
          <p>
            FoodLoop operates under the auspices of the Ministry of Food Processing Industries (MoFPI), Government of India. This Privacy Policy outlines the terms governing the collection, processing, retention, and dissemination of digital personal and operational data across institutional kitchens, food processing units, community receivers, and logistics drivers in compliance with the Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#1F4D3A] uppercase tracking-wide">
            2. Categories of Data Collected
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[#4A4D4A]">
            <li><b>Institutional Identity Data:</b> Name of institution, FSSAI registration numbers, facility address, operating capacity, and authorized supervisor details.</li>
            <li><b>Telemetry and Sensor Feeds:</b> Storage temperatures, machine power draw, operational runtimes, and GPS geolocation coordinates streamed during vehicle transit.</li>
            <li><b>Audit Logs:</b> Immutable records of quality screening authorizations, supervisor PIN verifications, receipt confirmations, and system role modifications.</li>
            <li><b>Offline Field Data:</b> Locally cached waste logs and sensor timestamps held securely in browser IndexedDB pending network synchronization.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#1F4D3A] uppercase tracking-wide">
            3. Purpose of Processing (Section 4, DPDP Act 2023)
          </h2>
          <p>
            All data processed by FoodLoop is utilized exclusively for specified public-purpose functions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#4A4D4A]">
            <li>Forecasting meal consumption to minimize agricultural raw material wastage.</li>
            <li>Verifying food safety and holding condition compliance under FSSAI standards.</li>
            <li>Optimizing redistribution routing to food banks and registered shelters.</li>
            <li>Generating official ESG compliance and greenhouse gas mitigation certificates.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#1F4D3A] uppercase tracking-wide">
            4. Data Retention, Security, and Nodal Redressal
          </h2>
          <p>
            Data is hosted within sovereign Indian data centers. Cryptographic hashing (SHA-256) is applied to all audit records and passwords. Any Data Principal wishing to exercise their rights of access, correction, or erasure under Section 12 of the DPDP Act 2023 may submit a formal request to our designated Nodal Officer via the <Link href="/legal/grievance" className="text-[#1F4D3A] underline font-medium">Grievance Redressal Portal</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
