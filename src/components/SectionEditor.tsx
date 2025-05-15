import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import grapesjsTailwind from "grapesjs-tailwind";
import { languages } from "../data/languages";

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

function SectionEditor({ selectedSectionId }: SectionEditorProps) {
	const [section, setSection] = useState<EditorSection | null>(null);
	const [html, setHtml] = useState<string>("");
	const [title, setTitle] = useState<string>("");
	const [contents, setContents] = useState<EditorSection["contents"]>([]);
	const [previewHtml, setPreviewHtml] = useState<{ __html: string }>({
		__html: "",
	});
	const [previewLang, setPreviewLang] = useState<string>(languages[0].code);
	const editorRef = useRef<any | null>(null);
	const editorContainerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const loadSection = async () => {
			if (!selectedSectionId) return;
			const selectedSection = await loadEditorSection(selectedSectionId);
			if (selectedSection) {
				setSection(selectedSection);
				setHtml(selectedSection.html || "");
				setTitle(selectedSection.title || "");
				setContents(selectedSection.contents);
			}
		};
		loadSection();
	}, [selectedSectionId]);

	useEffect(() => {
		setPreviewHtml(generatePreview());
	}, [html, contents, previewLang]);

	useEffect(() => {
		if (editorContainerRef.current && !editorRef.current) {
			editorRef.current = grapesjs.init({
				container: editorContainerRef.current,
				height: "500px",
				width: "100%",
				storageManager: false,
				fromElement: true,
				plugins: [grapesjsTailwind],
				pluginsOpts: {
					[grapesjsTailwind]: {},
				},
			});

			editorRef.current.on("component:update", () => {
				setHtml(editorRef.current?.getHtml() || "");
			});
		}
	}, []);

	useEffect(() => {
		if (editorRef.current) {
			editorRef.current.setComponents(html);
		}
	}, [html]);

	const handleContentChange = (index: number, key: string, value: string) => {
		const updatedContents = [...contents];
		updatedContents[index].content[key] = value;
		setContents(updatedContents);
		setPreviewHtml(generatePreview());
	};

	const handleLangChange = (index: number, value: string) => {
		const updatedContents = [...contents];
		updatedContents[index].langCode = value;
		setContents(updatedContents);
	};

	const generatePreview = () => {
		let mergedHtml = html;
		const filteredContents = contents.filter((content) => content.langCode === previewLang);
		filteredContents.forEach((contentItem) => {
			Object.keys(contentItem.content).forEach((key) => {
				const regex = new RegExp(`{{${key}}}`, "g");
				mergedHtml = mergedHtml.replace(regex, contentItem.content[key]);
			});
		});
		return { __html: mergedHtml };
	};

	const addContentSection = (key: string, lang: string, value: string) => {
		const newContent = {
			sectionId: section?.id || "",
			id: `new-${Date.now()}`,
			langCode: lang,
			content: { [key]: value },
		};
		setContents([...contents, newContent]);
	};

	if (!selectedSectionId) {
		return <div className="p-4">Bitte wählen Sie eine Sektion aus.</div>;
	}
	if (!section) return <div className="p-4">Loading...</div>;

	return (
		<div className="p-4 max-w-full mx-auto bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-4 text-gray-800">Editor</h2>

			<label className="block text-sm font-medium text-gray-700">Titel:</label>
			<input className="w-full border p-2 mb-4 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />

			<div>
				<div ref={editorContainerRef} className="border rounded mb-4 h-64"></div>
			</div>
			<hr />
			<div className="">
				<label className="block text-sm font-medium text-gray-700">Code Editor</label>
				<div className="border rounded mb-4 h-64">
					<Editor height="300px" defaultLanguage="html" value={html} onChange={(value) => setHtml(value || "")} />
				</div>
			</div>
			<h3 className="text-lg font-semibold mb-2">Section Contents</h3>
			{contents.map((contentItem, index) => (
				<div key={contentItem.id} className="mb-4 border p-2 rounded bg-gray-100">
					<label className="block text-sm font-medium text-gray-700">Sprache:</label>
					<select
						className="w-full border p-2 rounded"
						value={contentItem.langCode}
						onChange={(e) => handleLangChange(index, e.target.value)}
					>
						{languages.map((lang) => (
							<option key={lang.code} value={lang.code}>
								{lang.label}
							</option>
						))}
					</select>
					{Object.keys(contentItem.content).map((key) => (
						<div key={key} className="mb-2">
							<label className="block text-sm font-medium text-gray-700">{key}:</label>
							<input
								className="w-full border p-2 rounded"
								type="text"
								value={contentItem.content[key] || ""}
								onChange={(e) => handleContentChange(index, key, e.target.value)}
							/>
						</div>
					))}
				</div>
			))}

			<h3 className="text-lg font-semibold mb-2">Preview</h3>
			<label className="block text-sm font-medium text-gray-700">Preview Sprache:</label>
			<select
				className="w-full border p-2 mb-4 rounded"
				value={previewLang}
				onChange={(e) => setPreviewLang(e.target.value)}
			>
				{languages.map((lang) => (
					<option key={lang.code} value={lang.code}>
						{lang.label}
					</option>
				))}
			</select>
			<div className="border p-4 rounded bg-gray-50" dangerouslySetInnerHTML={previewHtml}></div>
		</div>
	);
}

export default SectionEditor;
