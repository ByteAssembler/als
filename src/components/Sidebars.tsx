// src/components/Sidebars.tsx
import React, { useEffect, useState } from "react";

// Typdefinitionen
interface Site {
  id: string;
  title: string;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  siteId: string;
}

interface SidebarsProps {
  selectedSiteId: string | null;
  onSiteSelect: (siteId: string | null) => void; // Korrektur: HIER
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string | null) => void;
}

function SiteList(
  { sites, onSiteSelect, selectedSiteId }: {
    sites: Site[];
    onSiteSelect: (siteId: string) => void;
    selectedSiteId: string | null;
  },
) {
  return (
    <div className="w-64 bg-gray-800 text-white p-4 h-[50dvh]">
      <h2 className="text-lg font-bold mb-4">Sites</h2>
      <ul>
        {sites.map((site) => (
          <li
            key={site.id}
            className={`cursor-pointer hover:bg-gray-700 p-2 rounded ${
              site.id === selectedSiteId ? "bg-gray-500" : ""
            }`}
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
    <div className="w-64 bg-gray-700 text-white p-4 h-[50dvh]">
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
  { selectedSiteId, onSiteSelect, selectedSectionId, onSectionSelect }:
    SidebarsProps,
) { // Korrektur: onSiteSelect hinzugefügt
  const [sites, setSites] = useState<Site[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingSiteId, setPendingSiteId] = useState<string | null>(null);

  const fetchSites = async (): Promise<Site[]> => {
    try {
      const response = await fetch("/api/sites");
      if (!response.ok) {
        throw new Error(
          `Fehler beim Abrufen der Sites: ${response.statusText}`,
        );
      }
      const sites: Site[] = await response.json();

      // Hole die Sections für jede Site
      for (const site of sites) {
        const sectionsResponse = await fetch(`/api/sites/${site.id}/sections`);
        if (sectionsResponse.ok) {
          site.sections = await sectionsResponse.json();
        } else {
          site.sections = [];
        }
      }

      return sites;
    } catch (error) {
      console.error("Fehler beim Abrufen der Sites:", error);
      return [];
    }
  };

  const fetchSections = async (siteId: string): Promise<Section[]> => {
    return sites.find((site) => site.id === siteId)?.sections || [];
  };

  useEffect(() => {
    const loadSites = async () => {
      try {
        const fetchedSites = await fetchSites();
        setSites(fetchedSites);
        if (fetchedSites.length > 0) {
          onSiteSelect(fetchedSites[0].id);
        }
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
          if (fetchedSections.length > 0) {
            onSectionSelect(fetchedSections[0].id);
          }
        } catch (err: any) {
          setError("Failed to load sections: " + err.message);
        }
      } else {
        setSections([]);
      }
    };
    loadSections();
  }, [selectedSiteId]);

  // Neuer useEffect für die Site-Auswahl
  useEffect(() => {
    if (pendingSiteId !== null) {
      onSectionSelect(null);
      setSections([]);
      onSiteSelect(pendingSiteId);
      setPendingSiteId(null);
    }
  }, [pendingSiteId, onSectionSelect, onSiteSelect]);

  return (
    <div className="flex">
      <div className="flex flex-col">
        <SiteList
          sites={sites}
          onSiteSelect={(siteId) => {
            setPendingSiteId(siteId);
          }}
          selectedSiteId={selectedSiteId}
        />

        {selectedSiteId && (
          <SectionList
            sections={sections}
            onSectionSelect={onSectionSelect}
            selectedSectionId={selectedSectionId}
          />
        )}
      </div>
      <div className="flex-1 p-4">
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
