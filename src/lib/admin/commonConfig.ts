import type { Column } from "../../components/ui/DataTable.svelte";
import { getTranslation } from "../utils/translation";
import { getGlobalLanguages, type Language } from "./languageConfig";

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

export function createCelebrityColumns(currentLanguage: string): Column[] {
	return [
		{
			header: "Name",
			key: "name",
			primary: true,
			render: (item) => {
				// Fix: Use the correct file path format and handle empty imageKey
				const imageHtml = item.imageKey && item.imageKey.trim()
					? `<img src="/api/files/${item.imageKey}" alt="${item.name}" class="w-8 h-8 rounded-full mr-2 object-cover" onerror="this.style.display='none'">`
					: '<div class="w-8 h-8 rounded-full mr-2 bg-gray-200 flex items-center justify-center"><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';

				return `<div class="flex items-center">
          ${imageHtml}
          <span class="font-medium">${item.name}</span>
        </div>`;
			}
		},
		{
			header: "Beruf",
			key: "profession",
			render: (item) => {
				const profession = getTranslation(item.profession, currentLanguage);
				return `<span class="text-sm">${profession}</span>`;
			}
		},
		{
			header: "Lebensdaten",
			key: "lifespan",
			render: (item) => {
				const bornYear = item.born ? new Date(item.born).getFullYear() : '?';
				const diedYear = item.died ? new Date(item.died).getFullYear() : 'heute';
				return `<span class="text-xs text-muted-foreground">${bornYear} - ${diedYear}</span>`;
			}
		},
		{
			header: "ALS Jahr",
			key: "alsYear",
			render: (item) => {
				return `<span class="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${item.alsYear}</span>`;
			}
		},
		{
			header: "Biografie",
			key: "bio",
			render: (item) => {
				const bio = getTranslation(item.bio, currentLanguage);
				const truncated = bio.length > 100 ? bio.substring(0, 100) + '...' : bio;
				return `<span class="text-xs text-muted-foreground" title="${bio}">${truncated}</span>`;
			}
		}
	];
}

export function createMapPointCategoryColumns(currentLanguage: string): Column[] {
	return [
		{
			header: "Kategorie-Name",
			key: "name",
			primary: true,
			render: (item) => {
				const name = getTranslation(item.name, currentLanguage);
				return `<span class="font-medium">${name}</span>`;
			}
		},
		{
			header: "Punkte",
			key: "mapPointsCount",
			render: (item) => {
				// Fix: Use correct property name and handle undefined
				const count = item.mapPoints?.length || 0;
				return `<span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">${count} Punkte</span>`;
			}
		}
	];
}

export function createMapPointColumns(currentLanguage: string): Column[] {
	return [
		{
			header: "Name",
			key: "name",
			primary: true,
			render: (item) => {
				const name = getTranslation(item.name, currentLanguage);
				return `<span class="font-medium">${name}</span>`;
			}
		},
		{
			header: "Kategorie",
			key: "category",
			render: (item) => {
				// Fix: Handle category mapping properly
				let categoryName = 'Unbekannt';
				if (item.category?.name) {
					categoryName = getTranslation(item.category.name, currentLanguage);
				} else if (item.category?.names && Array.isArray(item.category.names)) {
					const nameObj: Record<string, string> = {};
					item.category.names.forEach((n: any) => {
						nameObj[n.language] = n.text;
					});
					categoryName = getTranslation(nameObj, currentLanguage);
				}
				return `<span class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">${categoryName}</span>`;
			}
		},
		{
			header: "Koordinaten",
			key: "coordinates",
			render: (item) => {
				return `<span class="font-mono text-xs">
          ${Number(item.latitude).toFixed(4)}, ${Number(item.longitude).toFixed(4)}
        </span>`;
			}
		},
		{
			header: "Beschreibung",
			key: "description",
			render: (item) => {
				const description = getTranslation(item.description, currentLanguage);
				const truncated = description.length > 80 ? description.substring(0, 80) + '...' : description;
				return `<span class="text-xs text-muted-foreground" title="${description}">${truncated}</span>`;
			}
		}
	];
}
