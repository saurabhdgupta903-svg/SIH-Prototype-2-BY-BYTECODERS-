"use client";

import React, { useEffect, useRef } from "react";

interface MarkerData {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  label?: string;
  type?: "kitchen" | "receiver" | "driver";
}

interface Props {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  polylineCoordinates?: [number, number][]; // [lat, lng] array
  driverLocation?: { lat: number; lng: number };
  height?: string;
}

export function MapView({
  center = [18.5204, 73.8567],
  zoom = 13,
  markers = [],
  polylineCoordinates = [],
  driverLocation,
  height = "420px",
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      if (!isMounted) return;

      // Import Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center,
          zoom,
          zoomControl: true,
        });

        // OpenStreetMap Tile Layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        markersGroupRef.current = L.layerGroup().addTo(map);
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Update Markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();

        markers.forEach((m) => {
          const isKitchen = m.type === "kitchen";
          const iconColor = isKitchen ? "#1F4D3A" : "#B25E00";

          // Custom crisp SVG div icon
          const icon = L.divIcon({
            className: "custom-map-icon",
            html: `
              <div style="background-color: ${iconColor}; color: white; border: 2px solid white; border-radius: 2px; padding: 2px 6px; font-size: 11px; font-weight: bold; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3); display: flex; items-center; gap: 4px;">
                <span>${m.title}</span>
              </div>
            `,
            iconSize: [120, 24],
            iconAnchor: [60, 24],
          });

          L.marker([m.lat, m.lng], { icon })
            .bindPopup(`<b>${m.title}</b><br/>${m.label || ""}`)
            .addTo(markersGroupRef.current);
        });
      }

      // Update Polyline
      if (polylineLayerRef.current) {
        map.removeLayer(polylineLayerRef.current);
        polylineLayerRef.current = null;
      }

      if (polylineCoordinates && polylineCoordinates.length > 1) {
        const polyline = L.polyline(polylineCoordinates, {
          color: "#1F4D3A",
          weight: 4,
          opacity: 0.85,
          dashArray: "6, 8",
        }).addTo(map);
        polylineLayerRef.current = polyline;
        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
      }

      // Update Moving Driver Marker
      if (driverLocation) {
        if (!driverMarkerRef.current) {
          const driverIcon = L.divIcon({
            className: "driver-live-icon",
            html: `
              <div style="background-color: #1A6334; color: white; border: 2px solid #FFFFFF; border-radius: 2px; padding: 3px 6px; font-size: 10px; font-weight: bold; display: flex; items-center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background-color:#86EFAC;"></span>
                <span>Driver (MH-12-FL-2026)</span>
              </div>
            `,
            iconSize: [140, 26],
            iconAnchor: [70, 13],
          });
          driverMarkerRef.current = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon }).addTo(map);
        } else {
          driverMarkerRef.current.setLatLng([driverLocation.lat, driverLocation.lng]);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [center, zoom, markers, polylineCoordinates, driverLocation]);

  return (
    <div className="relative border border-[#CFCABD] rounded-sm overflow-hidden bg-[#F4F2EC]">
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />
      <div className="absolute top-2 right-2 z-[1000] bg-white border border-[#CFCABD] px-2 py-1 text-[10px] font-mono text-[#4A4D4A] rounded-sm shadow-none">
        OpenStreetMap Standard Tiles
      </div>
    </div>
  );
}
