import React from "react";

interface Props {
  rows?: number;
  heightClass?: string;
  className?: string;
}

export function SkeletonLoader({ rows = 3, heightClass = "h-4", className = "" }: Props) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-[#E7E4DC] rounded-sm ${heightClass}`}
          style={{ width: `${100 - idx * 8}%` }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SkeletonCard({ height = "h-28" }: { height?: string }) {
  return (
    <div className={`bg-white border border-[#CFCABD] rounded-sm p-4 animate-pulse ${height} flex flex-col justify-between`}>
      <div className="h-3 bg-[#E7E4DC] rounded-sm w-1/3 mb-2"></div>
      <div className="h-7 bg-[#E7E4DC] rounded-sm w-1/2 mb-2"></div>
      <div className="h-2.5 bg-[#E7E4DC] rounded-sm w-2/3"></div>
    </div>
  );
}
