"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"kitchen" | "fpu" | "receiver">("kitchen");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Pune");
  const [capacity, setCapacity] = useState("850");
  const [operatingHours, setOperatingHours] = useState("06:00-22:00");
  const [hasColdStorage, setHasColdStorage] = useState(true);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // In actual registration, calls backend auth registration
      await new Promise((r) => setTimeout(r, 600));
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-4 w-full">
      <div className="bg-white border border-[#CFCABD] rounded-sm p-6 space-y-5">
        <div className="border-b border-[#E7E4DC] pb-3">
          <div className="text-[11px] font-mono uppercase text-[#1F4D3A] font-bold">
            Module A: Facility Onboarding
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] mt-1">
            Register Institution, Food Processing Unit or Receiver
          </h1>
          <p className="text-[12px] text-[#5F6368] mt-0.5">
            Subject to administrative verification under MoFPI ecosystem guidelines.
          </p>
        </div>

        {success ? (
          <div className="bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] p-4 text-[13px] rounded-sm">
            Facility registration submitted successfully. Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 text-[13px]">
            {/* Account Type Selection */}
            <div>
              <label className="block font-medium text-[#1B1C1A] mb-1.5">
                Facility Classification
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType("kitchen")}
                  className={`py-2 px-3 text-center border rounded-sm font-medium ${
                    accountType === "kitchen"
                      ? "bg-[#1F4D3A] text-white border-[#1F4D3A]"
                      : "bg-[#F4F2EC] text-[#1B1C1A] border-[#CFCABD] hover:bg-[#E7E4DC]"
                  }`}
                >
                  Institutional Kitchen
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("fpu")}
                  className={`py-2 px-3 text-center border rounded-sm font-medium ${
                    accountType === "fpu"
                      ? "bg-[#1F4D3A] text-white border-[#1F4D3A]"
                      : "bg-[#F4F2EC] text-[#1B1C1A] border-[#CFCABD] hover:bg-[#E7E4DC]"
                  }`}
                >
                  Food Processing Unit
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("receiver")}
                  className={`py-2 px-3 text-center border rounded-sm font-medium ${
                    accountType === "receiver"
                      ? "bg-[#1F4D3A] text-white border-[#1F4D3A]"
                      : "bg-[#F4F2EC] text-[#1B1C1A] border-[#CFCABD] hover:bg-[#E7E4DC]"
                  }`}
                >
                  Receiver (NGO / Shelter)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Entity / Facility Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pune Central College Hostel"
                  className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm text-[13px] focus:outline-none focus:border-[#1F4D3A]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">City & District</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm text-[13px] focus:outline-none focus:border-[#1F4D3A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Physical Address (Geocoded via Nominatim)</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full street address for automated OSRM routing and distance matrix"
                className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm text-[13px] focus:outline-none focus:border-[#1F4D3A]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium mb-1">Daily Capacity ({accountType === "fpu" ? "kg/day" : "meals"})</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="08:00-22:00"
                  className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="cold-storage"
                  checked={hasColdStorage}
                  onChange={(e) => setHasColdStorage(e.target.checked)}
                  className="w-4 h-4 accent-[#1F4D3A]"
                />
                <label htmlFor="cold-storage" className="font-medium cursor-pointer">
                  Certified Cold Storage
                </label>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E7E4DC] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Authorized Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Set Account Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CFCABD] rounded-sm font-mono text-[13px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1F4D3A] text-white py-2 font-medium rounded-sm hover:bg-[#16382A]"
            >
              {submitting ? "Registering Facility..." : "Submit Registration for Verification"}
            </button>
          </form>
        )}

        <div className="text-center text-[12px] text-[#5F6368] pt-2">
          Already registered?{" "}
          <Link href="/login" className="text-[#1F4D3A] underline font-medium">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
