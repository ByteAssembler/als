import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { fetchDataFromServer } from "@/pages/api/trpc/serverHelpers";
import { i18n } from "@/i18n";
import markerIconImagePath from "/marker.png?url";
import { getImageUrlForImageKey } from "@/utils";

const MapComponent = (
	{
		lang, points, categories
	}: {
		lang: string | undefined | null;
		points: Awaited<ReturnType<typeof fetchDataFromServer<"mapPoint.list_by_language">>>;
		categories: Awaited<ReturnType<typeof fetchDataFromServer<"mapPointCategory.list_by_language">>>;
	}
) => {
	const mapRef = useRef<L.Map | null>(null);
	const markersRef = useRef<L.Marker[]>([]);
	const [category, setCategory] = useState("");

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

		const selectedpoints = category === "" ? points : points.filter((point) => point.category.name === category);
		let group: L.Marker[] = [];

		selectedpoints.forEach((point) => {
			const marker = L.marker([point.latitude, point.longitude], {
				icon: L.icon({
					iconUrl: getImageUrlForImageKey(point.category.iconKey) || markerIconImagePath,
					iconSize: [20, 20],
					iconAnchor: [15, 45],
				})
			})
				.bindPopup(`<b>${point.name}</b><p>${point.description}</p>`)
				.addTo(mapRef.current!);
			markersRef.current.push(marker);
			group.push(marker);
		});

		if (group.length > 1) {
			const groupLayer = L.featureGroup(group);
			mapRef.current.fitBounds(groupLayer.getBounds(), { padding: [50, 50] });
		} else if (group.length === 1) {
			mapRef.current.setView([group[0].getLatLng().lat, group[0].getLatLng().lng], 10);
		}
	}, [category]);

	return (
		<div className="z-0 relative">
			<div className="absolute top-4 right-4 z-[9999999]">
				<select
					className="bg-white border-2 border-gray-400 rounded-lg px-4 py-2 font-medium text-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
				>
					<option value="">
						{i18n.tLang(lang, "pages.homepage.map.allcategories")}
					</option>
					{categories.map((category) => (
						<option key={category.name} value={category.name || "Category Name"}>
							{category.name}
						</option>
					))}
				</select>
			</div>
			<div id="map-map" className="h-[500px] w-full rounded-lg shadow-md"></div>
		</div>
	);
};

export default MapComponent;
