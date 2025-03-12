import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint, MapPointType } from "@prisma/client";
import CategorySelector from "./CategorySelector";

// const data = [
//     {
//         name: "Hauptsitz",
//         locations: [{ name: "Olang", position: { lat: 46.7419, lng: 12.0196 } }],
//     },
//     {
//         name: "Krankenhäuser",
//         locations: [
//             { name: "Zentrum ALS Ulm", position: { lat: 48.402, lng: 10.0014 } },
//             { name: "Charité - Universitätsmedizin Berlin", position: { lat: 52.5268, lng: 13.3766 } },
//         ],
//     },
// ];

function MapComponent({ data, types }: { data: MapPoint[]; types: MapPointType[] }) {
    console.log(types);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const [category, setCategory] = useState<string>("");

    const customIcon = L.icon({
        iconUrl: "/icons8-google-maps-doodle/icons8-google-maps-48.png",  // Stelle sicher, dass marker.png in /public liegt
        iconSize: [40, 40],
        iconAnchor: [15, 45]
    });

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map-map").setView([46.7419, 12.0196], 6);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(mapRef.current);
        }
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;

        markersRef.current.forEach((marker) => mapRef.current?.removeLayer(marker));
        markersRef.current = [];

        const selectedCategories = (category ? [types.find((type) => type.name === category)]
        .filter((type): type is MapPointType => type !== undefined) : data)
        const selectedCategoriesIds: number[] = selectedCategories.length > 0 ? selectedCategories.map((type) => type.id) : [];

        let group: L.Marker[] = [];

        const points: MapPoint[] = data.filter((point) => selectedCategoriesIds.includes(point.typeId));
        
        points.forEach((point) => {
            if (point) {
                const marker = L.marker([point.latitude, point.longitude], { icon: customIcon })
                    .bindPopup(`<b>${point.name}</b><br><p>${point.description}</p>`)
                    .addTo(mapRef.current!);
                markersRef.current.push(marker);
                group.push(marker);
            }
        });

        if (group.length > 1) {
            const groupLayer = L.featureGroup(group);
            mapRef.current.fitBounds(groupLayer.getBounds(), { padding: [50, 50] });
        } else if (group.length === 1) {
            mapRef.current.setView([group[0].getLatLng().lat, group[0].getLatLng().lng], 10);
        }
    }, [category]);

    return (
        <div className="w-full ">
            <div className="relative">
                <select 
                    className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="" key="all">Alle Kategorien</option>
                    {types.length > 0 && types.map((type) => (
                        <option key={type.id} value={type.name}>
                            {type.name}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    ▼
                </div>
            </div>
            <div id="map-map" className="h-96 w-full rounded-lg shadow-md mt-4 bg-gray-100 pt-5"></div>
        </div>
    );
};

export default MapComponent;
