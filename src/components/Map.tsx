import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

  const customIcon = L.icon({
    iconUrl: "/marker.png", // Stelle sicher, dass marker.png in /public liegt
    iconSize: [30, 45],
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

    const selectedCategories = category
      ? [data.find((item) => item.name === category)]
      : data;
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
      mapRef.current.setView([
        group[0].getLatLng().lat,
        group[0].getLatLng().lng,
      ], 10);
    }
  }, [category]);

  return (
    <div>
      <select
        className="dropdown"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Alle Kategorien</option>
        {data.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name}
          </option>
        ))}
      </select>
      <div id="map-map" className="h-[500px] w-full rounded-lg shadow-md mt-2">
      </div>
    </div>
  );
};

export default MapComponent;
