"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon paths that webpack breaks
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const blueIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [0, -33],
});

const selectedIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
});

type GeoGarage = {
    erkenning_nummer?: string;
    erkenninghouder_naam?: string;
    erkenning_plaatsnaam?: string;
    erkenning_straat?: string;
    erkenning_huisnummer?: string;
    erkenning_postcode?: string;
    soort_erkenning_omschrijving?: string;
    lat: number;
    lng: number;
};

type Props = {
    garages: GeoGarage[];
    userPos: { lat: number; lng: number } | null;
    selected: GeoGarage | null;
    onSelect: (g: GeoGarage) => void;
};

function FlyToSelected({ selected }: { selected: GeoGarage | null }) {
    const map = useMap();
    useEffect(() => {
        if (selected) map.flyTo([selected.lat, selected.lng], 15, { duration: 0.8 });
    }, [selected, map]);
    return null;
}

function FitBounds({ garages, userPos }: { garages: GeoGarage[]; userPos: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (garages.length === 0) return;
        const points: [number, number][] = garages.map((g) => [g.lat, g.lng]);
        if (userPos) points.push([userPos.lat, userPos.lng]);
        map.fitBounds(L.latLngBounds(points), { padding: [30, 30] });
    }, [garages, userPos, map]);
    return null;
}

export default function LeafletMapInner({ garages, userPos, selected, onSelect }: Props) {
    const center: [number, number] = garages.length > 0
        ? [garages[0].lat, garages[0].lng]
        : [52.37, 4.9]; // Amsterdam default

    return (
        <>
            {/* Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                crossOrigin=""
            />
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds garages={garages} userPos={userPos} />
                <FlyToSelected selected={selected} />

                {/* User location pulse circle */}
                {userPos && (
                    <Circle
                        center={[userPos.lat, userPos.lng]}
                        radius={300}
                        pathOptions={{ color: "#6366f1", fillColor: "#6366f1", fillOpacity: 0.15, weight: 2 }}
                    />
                )}

                {/* Garage markers */}
                {garages.map((g, i) => (
                    <Marker
                        key={i}
                        position={[g.lat, g.lng]}
                        icon={selected === g ? selectedIcon : blueIcon}
                        eventHandlers={{ click: () => onSelect(g) }}
                    >
                        <Popup maxWidth={220}>
                            <div className="text-sm">
                                <p className="font-bold text-slate-900">{g.erkenninghouder_naam ?? "Garage"}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {[g.erkenning_straat, g.erkenning_huisnummer].filter(Boolean).join(" ")}<br />
                                    {g.erkenning_postcode} {g.erkenning_plaatsnaam}
                                </p>
                                {g.soort_erkenning_omschrijving && (
                                    <span className="mt-1.5 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        {g.soort_erkenning_omschrijving}
                                    </span>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </>
    );
}
