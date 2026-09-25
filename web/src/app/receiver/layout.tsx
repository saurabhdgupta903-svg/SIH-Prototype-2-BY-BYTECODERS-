import React from "react";
import { Sidebar } from "../../components/Sidebar";

export default function ReceiverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 max-w-7xl mx-auto w-full">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
