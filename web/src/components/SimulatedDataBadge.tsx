import React from "react";

interface Props {
  className?: string;
  context?: string;
}

export function SimulatedDataBadge({ className = "", context }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#E7E4DC] border border-[#CFCABD] text-[#4A4D4A] rounded-sm select-none ${className}`}
      title={context ? `Simulated data: ${context}` : "Simulated benchmark data"}
    >
      <span className="w-1.5 h-1.5 bg-[#80868B] rounded-full inline-block"></span>
      Simulated data
    </span>
  );
}
