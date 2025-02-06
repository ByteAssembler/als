// src/components/Sidebars.tsx
import React, { useEffect, useState } from "react";

// Typdefinitionen
interface Site {
  id: string;
  title: string;
}

interface Section {
  id: string;
  title: string;
  siteId: string;
}

interface SidebarsProps {
  selectedSiteId: string | null;
  onSectionSelect: (sectionId: string | null) => void;
  selectedSectionId: string | null;
  onSiteSelect: (siteId: string | null) => void; // Korrektur: HIER
}

function SiteList(
  { sites, onSiteSelect }: {
    sites: Site[];
    onSiteSelect: (siteId: string) => void;
  },
) {
  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Sites</h2>
      <ul>
        {sites.map((site) => (
          <li
            key={site.id}
            className="cursor-pointer hover:bg-gray-700 p-2 rounded"
            onClick={() => onSiteSelect(site.id)}
          >
            {site.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionList(
  { sections, onSectionSelect, selectedSectionId }: {
    sections: Section[];
    onSectionSelect: (sectionId: string | null) => void;
    selectedSectionId: string | null;
  },
) {
  return (
    <div className="w-64 bg-gray-700 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Sections</h2>
      {sections.length === 0 && <p>No sections found.</p>}
      <ul>
        {sections.map((section) => (
          <li
            key={section.id}
            className={`cursor-pointer hover:bg-gray-600 p-2 rounded ${
              section.id === selectedSectionId ? "bg-gray-500" : ""
            }`}
            onClick={() => onSectionSelect(section.id)}
          >
            {section.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Sidebars(
  { selectedSiteId, onSectionSelect, selectedSectionId, onSiteSelect }:
    SidebarsProps,
) { // Korrektur: onSiteSelect hinzugefügt
  const [sites, setSites] = useState<Site[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mock-Daten-Funktionen (ERSETZEN!)
  const fetchSites = async (): Promise<Site[]> => {
    // Hier stattdessen die echte API aufrufen
    return [
      { id: "site1", title: "My Website" },
      { id: "site2", title: "Another Site" },
    ];
  };

  const fetchSections = async (siteId: string): Promise<Section[]> => {
    // Hier stattdessen die echte API aufrufen
    if (siteId === "site1") {
      return [
        { id: "section1", title: "Hero Section", siteId: "site1" },
        { id: "section2", title: "About Us", siteId: "site1" },
      ];
    }
    return [];
  };

  useEffect(() => {
    const loadSites = async () => {
      try {
        const fetchedSites = await fetchSites();
        setSites(fetchedSites);
      } catch (err: any) {
        setError("Failed to load sites: " + err.message);
      }
    };
    loadSites();
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      if (selectedSiteId) {
        try {
          const fetchedSections = await fetchSections(selectedSiteId);
          setSections(fetchedSections);
        } catch (err: any) {
          setError("Failed to load sections: " + err.message);
        }
      } else {
        setSections([]);
      }
    };
    loadSections();
  }, [selectedSiteId]);

  return (
    <>
      <SiteList
        sites={sites}
        onSiteSelect={(siteId) => {
          onSectionSelect(null);
          setSections([]);
          onSiteSelect(siteId);
        }}
      />
      {selectedSiteId && (
        <SectionList
          sections={sections}
          onSectionSelect={onSectionSelect}
          selectedSectionId={selectedSectionId}
        />
      )}
      {error && <p className="text-red-500">{error}</p>}
    </>
  );
}
