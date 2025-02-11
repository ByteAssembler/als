import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface SectionContent {
    [key: string]: string;
}

export interface EditorSection {
    contents: {
        sectionId: string;
        id: string;
        langCode: string;
        content: SectionContent;
    }[];
    id: string;
    title: string;
    html: string;
    siteId: string;
}

async function loadEditorSection(sectionId: string): Promise<EditorSection | null> {
    const res = await fetch(`/api/sections/${sectionId}`);
    const data: EditorSection | { error: string } = await res.json();
    return "error" in data ? null : data;
}

interface SectionEditorProps {
    selectedSectionId: string | null;
}

function DraggableComponent({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = {
        transform: CSS.Translate.toString(transform),
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-2 bg-blue-300 cursor-move">
            {id}
        </div>
    );
}

function DroppableArea({ id, children }: { id: string; children?: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={`p-4 border ${isOver ? "bg-green-100" : "bg-gray-100"}`}>
            {children}
        </div>
    );
}

function SectionEditor({ selectedSectionId }: SectionEditorProps) {
    const [section, setSection] = useState<EditorSection | null>(null);
    const [html, setHtml] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [contents, setContents] = useState<EditorSection["contents"]>([]);
    const [langCode, setLangCode] = useState<string>("de");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSection = async () => {
            if (!selectedSectionId) return;
            const selectedSection = await loadEditorSection(selectedSectionId);
            if (selectedSection) {
                setSection(selectedSection);
                setHtml(selectedSection.html || "");
                setTitle(selectedSection.title || "");
                setContents(selectedSection.contents);
                setLangCode(selectedSection.contents[0]?.langCode || "de");
            } else {
                setError("Section not found.");
            }
        };
        loadSection();
    }, [selectedSectionId]);

    const saveSection = async () => {
        if (!section) return;

        const updatedSection: EditorSection = {
            ...section,
            title,
            html,
            contents,
        };

        console.log("Daten zum Speichern", updatedSection);
        alert("Section saved (check console for data)!");
    };

    if (!selectedSectionId) return <div className="p-4">Bitte wählen Sie eine Sektion aus.</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!section) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Editor</h2>

            <label className="block text-sm font-medium text-gray-700">Titel:</label>
            <input className="w-full border p-2 mb-4 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">HTML:</label>
                    <Editor height="300px" defaultLanguage="html" value={html} onChange={(value) => setHtml(value || "")} options={{ quickSuggestions: true, suggestOnTriggerCharacters: true }} />
                </div>
            </div>

            <DndContext>
                <DroppableArea id="drop-area">
                    <DraggableComponent id="Button" />
                    <DraggableComponent id="Text" />
                </DroppableArea>
            </DndContext>

            <h3 className="text-lg font-semibold mb-2">Section Contents</h3>
            {contents.map((contentItem, index) => (
                <div key={contentItem.id} className="mb-4 border p-2 rounded bg-gray-100">
                    <p className="text-xs text-gray-500">Content ID: {contentItem.id}</p>
                    <p className="text-xs text-gray-500">LangCode: {contentItem.langCode}</p>
                </div>
            ))}

            <button onClick={saveSection} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Speichern</button>
        </div>
    );
}

export default SectionEditor;
