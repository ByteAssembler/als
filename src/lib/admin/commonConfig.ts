import type { Column } from "../../components/ui/DataTable.svelte";
import { getTranslation } from "../utils/translation.js";
import { getGlobalLanguages, type Language } from "./languageConfig.js";

export function createStandardLanguages(): Language[] {
	return getGlobalLanguages();
}

export function createLinkColumns(currentLanguage: string): Column[] {
	return [
		{
			header: "Titel",
			key: "title",
			primary: true,
			render: (item) => {
				const title = getTranslation(item.title, currentLanguage);
				return `<div class="flex items-center"><span>${title}</span></div>`;
			}
		},
		{
			header: "URL",
			key: "url",
			clickable: true,
			onClick: (item) => {
				if (item.url) {
					const url = item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`;
					window.open(url, '_blank', 'noopener,noreferrer');
				}
			},
			render: (item) => {
				const isExternal = item.url?.startsWith('http');
				const icon = isExternal
					? '<svg class="inline w-3 h-3 ml-1 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>'
					: '<svg class="inline w-3 h-3 ml-1 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
				return `<span class="font-mono text-xs flex items-center cursor-pointer hover:text-blue-600 transition-colors">${item.url}${icon}</span>`;
			}
		},
		{
			header: "Beschreibung",
			key: "description",
			render: (item) => {
				const description = getTranslation(item.description, currentLanguage);
				return description ? `<span class="text-xs text-muted-foreground">${description}</span>` : '-';
			}
		}
	];
}
