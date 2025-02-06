// src/components/SectionEditor.tsx
import React, { useEffect, useState } from "react";

// Typdefinitionen
interface SectionContent {
  [key: string]: string; // Einfache Key-Value-Paare für den Inhalt
}

interface Section {
  id: string;
  title: string;
  html: string;
  contentTemplate: { [key: string]: string }; // Typ für contentTemplate
  siteId: string;
  contents: {
    sectionId: string;
    langCode: string;
    content: SectionContent;
  }[];
}

interface SectionEditorProps {
  selectedSectionId: string | null;
}

function SectionEditor({ selectedSectionId }: SectionEditorProps) {
  const [section, setSection] = useState<Section | null>(null);
  const [html, setHtml] = useState<string>("");
  const [content, setContent] = useState<SectionContent>({});
  const [langCode, setLangCode] = useState<string>("de");
  const [error, setError] = useState<string | null>(null);
  const [availableLangCodes, setAvailableLangCodes] = useState<string[]>([
    "de",
    "en",
    "fr",
  ]);

  // Mock-Daten-Funktion (ERSETZEN!)
  const fetchSection = async (sectionId: string): Promise<Section | null> => {
    // Hier stattdessen die echte API aufrufen
    if (sectionId === "section1") {
      return {
        id: "section1",
        title: "Hero Section",
        html:
          '<div class="{{lang.class}}"><h1>{{lang.title}}</h1><p>{{lang.text}}</p></div>',
        contentTemplate: {
          class: "string",
          title: "string",
          text: "string",
        },
        siteId: "site1",
        contents: [
          {
            sectionId: "section1",
            langCode: "de",
            content: {
              class: "hero",
              title: "Willkommen",
              text: "Dies ist die Hauptsektion.",
            },
          },
          {
            sectionId: "section1",
            langCode: "en",
            content: {
              class: "hero",
              title: "Welcome",
              text: "This is the hero section.",
            },
          },
        ],
      };
    }
    return null;
  };

  useEffect(() => {
    const loadSection = async () => {
      if (selectedSectionId) {
        try {
          const fetchedSection = await fetchSection(
            selectedSectionId,
          );
          if (fetchedSection) {
            setSection(fetchedSection);
            setHtml(fetchedSection.html || "");

            const langs = fetchedSection.contents.map((c) => c.langCode);
            setAvailableLangCodes(langs);
            handleLangChange(langCode, fetchedSection);
          } else {
            setError("Section not found.");
          }
        } catch (err: any) {
          setError("Failed to load section: " + err.message);
        }
      } else {
        setSection(null);
        setHtml("");
        setContent({});
      }
    };
    loadSection();
  }, [selectedSectionId]);

  const handleHtmlChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setHtml(event.target.value);
  };

  const handleContentChange = (key: string, value: string) => {
    setContent({ ...content, [key]: value });
  };

  const handleLangChange = (
    newLangCode: string,
    sectionData: Section = section!,
  ) => {
    setLangCode(newLangCode);
    const sectionContent = sectionData.contents.find((c) =>
      c.langCode === newLangCode
    );
    setContent(sectionContent ? sectionContent.content : {});
  };

  const saveSection = async () => {
    if (!section) return;

    const updatedSection: Section = {
      ...section,
      html,
      contents: section.contents.map((c) =>
        c.langCode === langCode ? { ...c, content } : c
      ),
    };

    try {
      // Hier muss die API aufgerufen werden.
      console.log("Daten zum Speichern", updatedSection);
      alert("Section saved (check console for data)!");
    } catch (error: any) {
      setError("Fehler beim Speichern: " + error.message);
    }
  };

  if (!selectedSectionId) {
    return <div className="p-4">Bitte wählen Sie eine Sektion aus.</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!section) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{section.title}</h2>

      <div className="mb-4">
        <label
          htmlFor="lang-select"
          className="block text-sm font-medium text-gray-700"
        >
          Sprache:
        </label>
        <select
          id="lang-select"
          value={langCode}
          onChange={(e) => handleLangChange(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {availableLangCodes.map((code) => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Content Inputs */}
        {Object.keys(section.contentTemplate).map((key) => (
          <div key={key}>
            <label
              htmlFor={key}
              className="block text-sm font-medium text-gray-700"
            >
              {key}
            </label>
            <input
              type="text"
              id={key}
              value={content[key] || ""}
              onChange={(e) => handleContentChange(key, e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label
          htmlFor="html-editor"
          className="block text-sm font-medium text-gray-700"
        >
          HTML
        </label>
        <textarea
          id="html-editor"
          value={html}
          onChange={handleHtmlChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          rows={10}
        />
      </div>

      <button
        onClick={saveSection}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Save
      </button>
    </div>
  );
}

export default SectionEditor;
