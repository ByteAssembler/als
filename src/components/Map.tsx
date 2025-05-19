import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint, MapPointType } from "@prisma/client";
import CategorySelector from "./CategorySelector";

const data = [
	{
		name: "Hauptsitz",
		locations: [{ name: "Olang", position: { lat: 46.7419, lng: 12.0196 } }],
	},
	{
		name: "Krankenhäuser",
		locations: [
			{ name: "Zentrum ALS Ulm", position: { lat: 48.402, lng: 10.0014 } },
			{
				name: "Charité - Universitätsmedizin Berlin",
				position: { lat: 52.5268, lng: 13.3766 },
			},
		],
	},
];

const MapComponent = () => {
	const mapRef = useRef<L.Map | null>(null);
	const markersRef = useRef<L.Marker[]>([]);
	const [category, setCategory] = useState("");

    let url = "/marker.png";
    switch (category) {
        case "event":
            url = "/event.png";
            break;
        case "hospital":
            url = "/hospital_marker.png";
            break;
        case "self_help_group":
            url = "/self_help_group.png";
            break;
        case "study":
            url = "/study.png";
            break;
        default:
            url = "/marker.png";
    }

	const customIcon = L.icon({
		iconUrl: url,
		iconSize: [45, 45],
		iconAnchor: [15, 45],
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

		const selectedCategories = category ? [data.find((item) => item.name === category)] : data;
		let group: L.Marker[] = [];

		selectedCategories.forEach((category) => {
			if (category) {
				category.locations.forEach((loc) => {
					const marker = L.marker([loc.position.lat, loc.position.lng], {
						icon: customIcon,
					})
						.bindPopup(`<b>${loc.name}</b>`)
						.addTo(mapRef.current!);
					markersRef.current.push(marker);
					group.push(marker);
				});
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
		<div className="z-0">
			<select className="dropdown" value={category} onChange={(e) => setCategory(e.target.value)}>
				<option value="">Alle Kategorien</option>
				{data.map((category) => (
					<option key={category.name} value={category.name}>
						{category.name}
					</option>
				))}
			</select>
			<div id="map-map" className="h-[500px] w-full rounded-lg shadow-md mt-2"></div>
		</div>
	);
};

export default MapComponent;
