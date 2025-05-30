import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { fetchDataFromServer } from "../pages/api/trpc/serverHelpers";
import { i18n } from "@/i18n";

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

  let url = "/marker.png";
  switch (category) {
    // Events
    case "event":
    case "Aktionen / Veranstaltungen":
    case "Events / Activities":
    case "Eventi / Attività":
      url = "https://img.icons8.com/ios-filled/50/000000/calendar.png";
      break;

    // Hospitals
    case "hospital":
      url = "https://img.icons8.com/ios-filled/50/000000/hospital.png";
      break;

    // Self-help groups
    case "self_help_group":
    case "Selbsthilfegruppe":
    case "Support Groups":
    case "Gruppi di auto-aiuto":
      url = "https://img.icons8.com/ios-filled/50/000000/conference.png";
      break;

    // Studies
    case "study":
    case "Studien (wo Teilnahme möglich?)":
    case "Clinical Studies (participation possible)":
    case "Studi clinici (partecipazione possibile)":
      url = "https://img.icons8.com/ios-filled/50/000000/open-book.png";
      break;

    // Clinics
    case "clinic":
    case "Kliniken":
    case "Clinics":
    case "Cliniche":
      url = "https://img.icons8.com/ios-filled/50/000000/clinic.png";
      break;

    case "research_center":
      url = "https://img.icons8.com/ios-filled/50/000000/microscope.png";
      break;

    // Organizations
    case "organization":
    case "Vereine":
    case "Associations":
    case "Associazioni":
      url = "https://img.icons8.com/ios-filled/50/000000/organization.png";
      break;

    case "therapy":
      url = "https://img.icons8.com/ios-filled/50/000000/therapy.png";
      break;

    case "support":
      url = "https://img.icons8.com/ios-filled/50/000000/helping-hand.png";
      break;

    default:
      url = "https://img.icons8.com/ios-filled/50/000000/marker.png";
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

    const selectedCategories = category ? [points.find((item) => item.name === category)] : points;
    let group: L.Marker[] = [];

    console.log("selectedCategories", selectedCategories, url, points);


    selectedCategories.forEach((category) => {
      if (category) {
        points.forEach((point) => {
          const marker = L.marker([point.latitude, point.longitude], {
            icon: customIcon,
          })
            .bindPopup(`<b>${point.name}</b><p>${point.description}</p>`)
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
