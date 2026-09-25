"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "mr";

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const translations: Translations = {
  appName: {
    en: "FoodLoop",
    hi: "फूडलूप",
    mr: "फूडलूप"
  },
  tagline: {
    en: "Smart Food Waste Reduction and Sustainable Redistribution Ecosystem",
    hi: "स्मार्ट अन्न नासाडी निवारण व शाश्वत पुनर्वितरण परिसंस्था",
    mr: "स्मार्ट अन्न नासाडी निवारण व शाश्वत पुनर्वितरण परिसंस्था"
  },
  ministry: {
    en: "Ministry of Food Processing Industries (MoFPI) | SIH 2026",
    hi: "अन्न प्रक्रिया उद्योग मंत्रालय (MoFPI) | SIH 2026",
    mr: "अन्न प्रक्रिया उद्योग मंत्रालय (MoFPI) | SIH 2026"
  },
  navDashboard: {
    en: "Dashboard",
    hi: "डॅशबोर्ड",
    mr: "मुख्य डॅशबोर्ड"
  },
  navDailyPlan: {
    en: "Daily Action Plan",
    hi: "दैनिक कृती योजना",
    mr: "दैनंदिन कृती योजना"
  },
  navForecast: {
    en: "Demand Forecast",
    hi: "मागणी अंदाज",
    mr: "मागणीचा अंदाज"
  },
  navWasteRecord: {
    en: "Record Waste",
    hi: "अन्न नासाडी नोंदवा",
    mr: "अन्न नासाडी नोंदवा"
  },
  navWasteAnalysis: {
    en: "Waste Analytics",
    hi: "नासाडी विश्लेषण",
    mr: "नासाडी विश्लेषण"
  },
  navSurplus: {
    en: "Surplus & Matching",
    hi: "अतिरिक्त अन्न व वाटप",
    mr: "अतिरिक्त अन्न व वाटप"
  },
  navQuality: {
    en: "Quality & Safety Check",
    hi: "अन्न सुरक्षा व तपासणी",
    mr: "अन्न सुरक्षा व तपासणी"
  },
  navLogistics: {
    en: "Route & Live Tracking",
    hi: "वाहतूक व थेट ट्रॅकिंग",
    mr: "मार्ग व थेट ट्रॅकिंग"
  },
  navProcessing: {
    en: "Processing Unit & Sensors",
    hi: "प्रक्रिया केंद्र व सेन्सर्स",
    mr: "प्रक्रिया केंद्र व सेन्सर्स"
  },
  navProcurement: {
    en: "Procurement Intelligence",
    hi: "खरेदी नियोजन",
    mr: "खरेदी नियोजन"
  },
  navCostCalculator: {
    en: "Cost of Waste",
    hi: "नासाडी खर्च गणक",
    mr: "नासाडी खर्च गणक"
  },
  navESG: {
    en: "Sustainability & ESG",
    hi: "शाश्वतता व ESG अहवाल",
    mr: "शाश्वतता व ESG अहवाल"
  },
  navAdmin: {
    en: "Regional Overview",
    hi: "प्रादेशिक आढावा",
    mr: "प्रादेशिक आढावा"
  },
  expectedDemand: {
    en: "Expected Demand",
    hi: "अपेक्षित मागणी",
    mr: "अपेक्षित मागणी"
  },
  recommendedProduction: {
    en: "Recommended Production",
    hi: "शिफारस केलेले उत्पादन",
    mr: "शिफारस केलेले उत्पादन"
  },
  predictedSurplus: {
    en: "Predicted Surplus",
    hi: "अपेक्षित अतिरिक्त अन्न",
    mr: "अपेक्षित अतिरिक्त अन्न"
  },
  foodAtRisk: {
    en: "Food at Risk",
    hi: "धोक्यात असलेले अन्न",
    mr: "धोक्यात असलेले अन्न"
  },
  simulatedDataLabel: {
    en: "Simulated data",
    hi: "सिम्युलेटेड डेटा",
    mr: "सिम्युलेटेड डेटा"
  },
  offlinePending: {
    en: "records pending synchronisation",
    hi: "नोंदी ऑफलाइन सिंक प्रलंबित",
    mr: "नोंदी ऑफलाइन सिंक प्रलंबित"
  },
  offlineSynced: {
    en: "Synchronised",
    hi: "सिंक झाले",
    mr: "सिंक झाले"
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("foodloop_lang") as Language;
    if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("foodloop_lang", newLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      <div className={lang === "hi" || lang === "mr" ? "font-devanagari" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
