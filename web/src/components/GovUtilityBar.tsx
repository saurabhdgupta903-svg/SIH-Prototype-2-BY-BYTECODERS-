"use client";

import React, { useState, useEffect } from "react";
import { useTranslation, Language } from "../lib/i18n";

export function GovUtilityBar() {
  const { lang, setLang } = useTranslation();
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "large") {
      root.style.fontSize = "17px";
    } else if (fontSize === "xlarge") {
      root.style.fontSize = "19px";
    } else {
      root.style.fontSize = "15px";
    }
  }, [fontSize]);

  return (
    <div className="bg-[#E7E4DC] border-b border-[#CFCABD] text-[12px] text-[#1B1C1A] px-4 py-1 flex flex-wrap items-center justify-between">
      <div className="flex items-center gap-3">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:bg-white focus:px-2 focus:py-1 underline font-medium">
          Skip to main content
        </a>
        <span className="font-medium text-[#4A4D4A]">GOVERNMENT OF INDIA</span>
        <span className="text-[#80868B]">|</span>
        <span className="hidden sm:inline text-[#4A4D4A]">Ministry of Food Processing Industries</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Accessibility Text Size */}
        <div className="flex items-center border border-[#CFCABD] bg-white rounded-sm divide-x divide-[#CFCABD]">
          <button
            onClick={() => setFontSize("normal")}
            className={`px-1.5 py-0.5 font-mono ${fontSize === "normal" ? "bg-[#1F4D3A] text-white" : "hover:bg-[#F4F2EC]"}`}
            title="Standard Font Size"
            aria-label="Standard Font Size"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize("large")}
            className={`px-1.5 py-0.5 font-mono font-medium ${fontSize === "large" ? "bg-[#1F4D3A] text-white" : "hover:bg-[#F4F2EC]"}`}
            title="Large Font Size"
            aria-label="Large Font Size"
          >
            A
          </button>
          <button
            onClick={() => setFontSize("xlarge")}
            className={`px-1.5 py-0.5 font-mono font-bold ${fontSize === "xlarge" ? "bg-[#1F4D3A] text-white" : "hover:bg-[#F4F2EC]"}`}
            title="Extra Large Font Size"
            aria-label="Extra Large Font Size"
          >
            A+
          </button>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-[#5F6368]">Language:</span>
          <button
            onClick={() => setLang("en")}
            className={`px-1.5 py-0.5 rounded-sm ${lang === "en" ? "bg-[#1F4D3A] text-white" : "hover:underline text-[#1B1C1A]"}`}
          >
            English
          </button>
          <span className="text-[#80868B]">/</span>
          <button
            onClick={() => setLang("hi")}
            className={`px-1.5 py-0.5 rounded-sm ${lang === "hi" ? "bg-[#1F4D3A] text-white" : "hover:underline text-[#1B1C1A]"}`}
          >
            हिन्दी
          </button>
          <span className="text-[#80868B]">/</span>
          <button
            onClick={() => setLang("mr")}
            className={`px-1.5 py-0.5 rounded-sm ${lang === "mr" ? "bg-[#1F4D3A] text-white" : "hover:underline text-[#1B1C1A]"}`}
          >
            मराठी
          </button>
        </div>
      </div>
    </div>
  );
}
