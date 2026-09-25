import type { Metadata } from "next";
import "./globals.css";
import { GovUtilityBar } from "../components/GovUtilityBar";
import { GovHeader } from "../components/GovHeader";
import { GovFooter } from "../components/GovFooter";
import { OfflineBanner } from "../components/OfflineBanner";
import { LanguageProvider } from "../lib/i18n";
import { AuthProvider } from "../lib/auth";

export const metadata: Metadata = {
  title: "FoodLoop | Ministry of Food Processing Industries (MoFPI) - SIH 2026",
  description: "Smart Food Waste Reduction and Sustainable Redistribution Ecosystem for Institutional Kitchens and Food Processing Units (SIH26234)",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F4F2EC] text-[#1B1C1A] min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <AuthProvider>
            <GovUtilityBar />
            <GovHeader />
            <OfflineBanner />
            <main id="main-content" className="flex-1 flex flex-col">
              {children}
            </main>
            <GovFooter />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
