"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { apiRequest, WS_BASE_URL } from "../../../lib/api";
import { MapView } from "../../../components/MapView";
import { SimulatedDataBadge } from "../../../components/SimulatedDataBadge";
import { SkeletonLoader } from "../../../components/SkeletonLoader";

export default function DriverRoutePage() {
  const [routePlan, setRoutePlan] = useState<any>(null);
  const [traceability, setTraceability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [driverPos, setDriverPos] = useState({ lat: 18.5204, lng: 73.8567 });
  const [deliveryStatus, setDeliveryStatus] = useState("in_transit");
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize Route
  const fetchRouteAndTraceability = async () => {
    try {
      const [rData, tData] = await Promise.all([
        apiRequest("/api/logistics/optimize-route", {
          method: "POST",
          body: JSON.stringify({ surplus_id: 1, receiver_id: 1 }),
        }),
        apiRequest("/api/logistics/traceability/FL-2026-000182"),
      ]);
      setRoutePlan(rData);
      setTraceability(tData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteAndTraceability();

    // Connect to WebSocket for live driver tracking
    try {
      const wsUrl = `${WS_BASE_URL}/ws/driver-tracking`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "DRIVER_LOCATION" && msg.data) {
            setDriverPos({ lat: msg.data.lat, lng: msg.data.lng });
          }
        } catch (e) {
          console.error(e);
        }
      };
      ws.onclose = () => setWsConnected(false);
    } catch (e) {
      console.warn("WebSocket not available, local telemetry simulation active.");
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Pre-calculated route points along the OSRM road corridor between Sahyadri Kitchen and Annapoorna Kitchen
  const roadWaypoints: [number, number][] = [
    [18.5204, 73.8567],
    [18.5228, 73.8542],
    [18.5260, 73.8510],
    [18.5290, 73.8475],
    [18.5314, 73.8446],
  ];

  // Simulation step controller
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setInterval(() => {
        setSimStep((prev) => {
          const next = prev + 1;
          if (next >= roadWaypoints.length) {
            setIsSimulating(false);
            setDeliveryStatus("delivered");
            return prev;
          }
          const [lat, lng] = roadWaypoints[next];
          setDriverPos({ lat, lng });

          // Send over WebSocket if connected
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "SIMULATE_STEP",
                data: { lat, lng, status: "in_transit" },
              })
            );
          }
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isSimulating]);

  const handleStartSimulation = () => {
    setSimStep(0);
    setDriverPos({ lat: roadWaypoints[0][0], lng: roadWaypoints[0][1] });
    setDeliveryStatus("in_transit");
    setIsSimulating(true);
  };

  const handleConfirmReceipt = async () => {
    try {
      await apiRequest("/api/logistics/confirm-delivery", {
        method: "POST",
        body: JSON.stringify({
          surplus_id: 1,
          portions_received: 45,
          notes: "Received in thermal cambro at 62°C. Verified and accepted by Sunita Patil (Annapoorna Community Kitchen).",
        }),
      });
      setDeliveryConfirmed(true);
      fetchRouteAndTraceability();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <SkeletonLoader rows={8} heightClass="h-16" />;

  const r = routePlan;
  const t = traceability;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CFCABD] gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#1F4D3A] uppercase tracking-wider font-semibold">
            Modules K, L & M: Logistics & Live Tracking (Demo Steps 5 & 6)
          </div>
          <h1 className="text-xl font-bold text-[#1F4D3A] tracking-tight">
            OR-Tools Route Optimization & Live Driver Telemetry
          </h1>
          <p className="text-[12px] text-[#5F6368]">
            Route Code: <b className="font-mono text-[#1B1C1A]">{r.route_code}</b> | Vehicle: MH-12-FL-2026 (Electric Van)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedDataBadge context="Simulated driver movement & OSRM road polyline" />
          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="bg-[#1F4D3A] text-white px-3 py-1.5 text-xs font-semibold rounded-sm hover:bg-[#16382A] disabled:opacity-50"
          >
            {isSimulating ? "Simulating GPS Stream..." : "▶ Simulate Driver Movement"}
          </button>
        </div>
      </div>

      {deliveryConfirmed && (
        <div className="bg-[#EBF5EE] border border-[#1A6334] text-[#1A6334] p-4 rounded-sm text-[13px] flex items-center justify-between">
          <span>
            <b>Step 6 Complete:</b> Receiver confirmed receipt of 45 meals. Immediate impact credited to sustainability ledger.
          </span>
          <Link
            href="/kitchen/reports"
            className="bg-[#1A6334] text-white px-3 py-1 text-xs rounded-sm hover:underline ml-4"
          >
            Step 7: View Impact & ESG PDF →
          </Link>
        </div>
      )}

      {/* Real-time Tracking Map & Route Polyline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1F4D3A]">
              Live Road Route & Driver GPS (OSRM Polyline)
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-[#5F6368]">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-[#1A6334]" : "bg-[#80868B]"}`} />
              <span>{wsConnected ? "WebSocket Live" : "Local Telemetry"}</span>
            </div>
          </div>

          <MapView
            center={[18.525, 73.85]}
            zoom={14}
            markers={[
              { id: 1, lat: 18.5204, lng: 73.8567, title: "Sahyadri Kitchen (Pickup)", label: "45 portions loaded", type: "kitchen" },
              { id: 2, lat: 18.5314, lng: 73.8446, title: "Annapoorna Kitchen (Dropoff)", label: "Dropoff Destination", type: "receiver" },
            ]}
            polylineCoordinates={roadWaypoints}
            driverLocation={driverPos}
            height="440px"
          />

          <div className="bg-white border border-[#CFCABD] p-3 rounded-sm text-[12px] flex flex-wrap items-center justify-between text-[#4A4D4A]">
            <div>
              <b>Total Road Distance:</b> <span className="font-mono">{r.total_distance_km} km</span>
            </div>
            <div>
              <b>Estimated Travel Time:</b> <span className="font-mono">{r.estimated_duration_minutes} mins</span>
            </div>
            <div>
              <b>Current Driver Status:</b>{" "}
              <span className="font-bold text-[#1A6334] uppercase">{deliveryStatus.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Timeline & Receiver Confirmation Button */}
        <div className="space-y-4">
          {/* Stops List */}
          <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F4D3A]">
              Sequence of Scheduled Stops
            </h3>
            <div className="space-y-2 text-[12px]">
              {r.stops.map((stop: any) => (
                <div key={stop.sequence} className="p-2.5 bg-[#FCFBF9] border border-[#CFCABD] rounded-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1B1C1A]">
                      Stop {stop.sequence}: {stop.location_name}
                    </span>
                    <span className="font-mono text-[11px] text-[#5F6368]">{stop.estimated_arrival}</span>
                  </div>
                  <div className="text-[11px] text-[#5F6368] mt-0.5">{stop.address}</div>
                  <div className="text-[11px] text-[#1A6334] font-medium mt-1">
                    {stop.stop_type === "pickup" ? `Pickup: ${stop.portions} meals` : `Dropoff: ${stop.portions} meals`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receiver Confirmation Card */}
          <div className="bg-white border border-[#CFCABD] rounded-sm p-4 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1F4D3A]">
              Receiver Delivery Verification
            </h3>
            <p className="text-[12px] text-[#4A4D4A]">
              Upon vehicle arrival at Annapoorna Community Kitchen, the receiver confirms quantity received to complete chain of custody.
            </p>

            <button
              onClick={handleConfirmReceipt}
              disabled={deliveryConfirmed}
              className="w-full bg-[#1A6334] text-white py-2 text-xs font-bold rounded-sm hover:bg-[#15522A] disabled:opacity-50"
            >
              {deliveryConfirmed ? "✓ Delivery Verified (45 Meals)" : "Step 6: Receiver Confirms 45 Meals Received"}
            </button>
          </div>
        </div>
      </div>

      {/* Traceability: Chain of Custody */}
      {t && (
        <div className="bg-white border border-[#CFCABD] rounded-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#1F4D3A] uppercase tracking-wide">
                Traceability Chain of Custody: {t.traceability_id}
              </h3>
              <p className="text-xs text-[#5F6368]">
                End-to-end milestone audit log with cryptographic timestamps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-[11px]">
            {t.events.map((ev: any, idx: number) => (
              <div
                key={idx}
                className={`p-2.5 border rounded-sm ${
                  ev.status === "completed"
                    ? "bg-[#EBF5EE] border-[#1A6334] text-[#1A6334]"
                    : "bg-[#FCFBF9] border-[#CFCABD] text-[#4A4D4A]"
                }`}
              >
                <div className="font-bold">{ev.stage}</div>
                <div className="font-mono text-[10px] text-[#5F6368] mt-1">{ev.timestamp.split(" ")[1] || "Done"}</div>
                <div className="text-[10px] mt-1 truncate" title={ev.actor}>{ev.actor}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
