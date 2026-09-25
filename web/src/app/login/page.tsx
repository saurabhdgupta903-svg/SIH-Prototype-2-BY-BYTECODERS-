"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRoleDemo } = useAuth();
  const [email, setEmail] = useState("kitchen@foodloop.gov.in");
  const [password, setPassword] = useState("kitchen123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const u = await login(email, password);
      // Route based on role
      if (u.role === "kitchen_manager") router.push("/kitchen/dashboard");
      else if (u.role === "fpu_manager") router.push("/processing/efficiency");
      else if (u.role === "receiver") router.push("/receiver/donations");
      else if (u.role === "driver") router.push("/driver/route");
      else if (u.role === "admin" || u.role === "reviewer") router.push("/admin/dashboard");
      else router.push("/kitchen/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickRole = (role: any, em: string, pw: string, dest: string) => {
    setEmail(em);
    setPassword(pw);
    switchRoleDemo(role);
    router.push(dest);
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4 w-full">
      <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-5">
        <div className="border-b border-[#E7E4DC] pb-3">
          <div className="text-[11px] font-mono uppercase text-[#1F4D3A] font-bold">
            Ministry of Food Processing Industries
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] mt-1">
            FoodLoop Institutional Sign In
          </h1>
          <p className="text-[12px] text-[#5F6368] mt-0.5">
            Access authorized role dashboard and real-time operational feeds.
          </p>
        </div>

        {error && (
          <div className="bg-[#FDF2F2] border border-[#A51D24] text-[#A51D24] p-3 text-[12px] rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#1B1C1A] mb-1">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px] focus:outline-none focus:border-[#1F4D3A]"
              placeholder="e.g. kitchen@foodloop.gov.in"
            />
          </div>

          <div>
            <label className="block font-medium text-[#1B1C1A] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px] focus:outline-none focus:border-[#1F4D3A]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1F4D3A] text-white py-2 font-medium rounded-sm hover:bg-[#16382A] disabled:opacity-50"
          >
            {submitting ? "Verifying Credentials..." : "Sign In to FoodLoop"}
          </button>
        </form>

        {/* Quick Role Selection for Hackathon Demo */}
        <div className="pt-4 border-t border-[#E7E4DC] space-y-2">
          <div className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">
            Quick 1-Click Demo Profiles:
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleQuickRole("kitchen_manager", "kitchen@foodloop.gov.in", "kitchen123", "/kitchen/dashboard")}
              className="p-1.5 border border-[#CFCABD] bg-[#F4F2EC] hover:bg-[#E7E4DC] text-left rounded-sm font-medium"
            >
              Kitchen Manager
            </button>
            <button
              onClick={() => handleQuickRole("admin", "admin@foodloop.gov.in", "admin123", "/admin/dashboard")}
              className="p-1.5 border border-[#CFCABD] bg-[#F4F2EC] hover:bg-[#E7E4DC] text-left rounded-sm font-medium"
            >
              Admin / MoFPI Director
            </button>
            <button
              onClick={() => handleQuickRole("fpu_manager", "fpu@foodloop.gov.in", "fpu123", "/processing/efficiency")}
              className="p-1.5 border border-[#CFCABD] bg-[#F4F2EC] hover:bg-[#E7E4DC] text-left rounded-sm font-medium"
            >
              Processing Unit Lead
            </button>
            <button
              onClick={() => handleQuickRole("receiver", "receiver@foodloop.gov.in", "receiver123", "/receiver/donations")}
              className="p-1.5 border border-[#CFCABD] bg-[#F4F2EC] hover:bg-[#E7E4DC] text-left rounded-sm font-medium"
            >
              Receiver (NGO / Shelter)
            </button>
            <button
              onClick={() => handleQuickRole("driver", "driver@foodloop.gov.in", "driver123", "/driver/route")}
              className="p-1.5 border border-[#CFCABD] bg-[#F4F2EC] hover:bg-[#E7E4DC] text-left rounded-sm font-medium"
            >
              Logistics Driver
            </button>
            <button
              onClick={() => handleQuickRole("reviewer", "reviewer@foodloop.gov.in", "reviewer123", "/admin/dashboard")}
              className="p-1.5 border border-[#CFCABD] bg-[#F4F2EC] hover:bg-[#E7E4DC] text-left rounded-sm font-medium"
            >
              Govt Reviewer
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-[12px] text-[#5F6368]">
          Need to register a new institution or receiver?{" "}
          <Link href="/register" className="text-[#1F4D3A] underline font-medium">
            Register Facility
          </Link>
        </div>
      </div>
    </div>
  );
}
