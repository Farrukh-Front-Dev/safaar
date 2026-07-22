"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

// Bundler (Turbopack) statik marker rasm yo'llarini noto'g'ri hal qiladi —
// shuning uchun ikonkalar CDN'dan olinadi, standart Leaflet default ikonkasi
// o'rniga ishlatiladi.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Toshkent — koordinata hali belgilanmaganda xaritaning boshlang'ich markazi. */
const DEFAULT_CENTER: [number, number] = [41.311081, 69.240562];

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  /** Tashqaridan (qidiruv natijasi tanlanganda) xaritani shu nuqtaga suradi. */
  flyTo?: { lat: number; lng: number } | null;
}

function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e: { latlng: { lat: number; lng: number } }) {
      onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

function FlyToHandler({ flyTo }: { flyTo?: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) map.flyTo([flyTo.lat, flyTo.lng], 15, { duration: 0.8 });
  }, [flyTo, map]);
  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  onChange,
  flyTo,
}: LocationMapProps) {
  const hasPosition = typeof latitude === "number" && typeof longitude === "number";
  const center: [number, number] = hasPosition
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={hasPosition ? 15 : 11}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      <FlyToHandler flyTo={flyTo} />
      {hasPosition && (
        <Marker
          position={[latitude, longitude]}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend: (e: { target: unknown }) => {
              const pos = (e.target as L.Marker).getLatLng();
              onChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
            },
          }}
        />
      )}
    </MapContainer>
  );
}
