import type { FormField } from "../../components/ui/MultiLanguageFormModal.svelte";
import { createAdminEntityHelper, type DataTransformers } from "./createAdminHelper.js";
import { trpcAuthQuery } from "../../pages/api/trpc/trpc.js";
import { getGlobalLanguages, createInitialFormDataForLanguages } from "./languageConfig.js";

// Link-specific types
interface LinkApiType {
	id: number;
	url: string;
	names?: Array<{ text: string; language: string }>;
	descriptions?: Array<{ text: string; language: string }>;
}

interface LinkFormType {
	id?: number;
	title: Record<string, string>;
	description: Record<string, string>;
	url: string;
	order: number;
	isActive: boolean;
}

// Create API payload type for creation/update
interface LinkApiPayload {
	name: Record<string, string>;
	description: Record<string, string>;
	url: string;
}

// Link-specific transformers with proper handling of both API and form data
const linkTransformers: DataTransformers<any, LinkFormType> = {
	transformApiToForm: (apiData) => {
		const titleObj: Record<string, string> = {};
		const descriptionObj: Record<string, string> = {};

		// Handle API format (names/descriptions arrays)
		if (apiData.names && Array.isArray(apiData.names)) {
			apiData.names.forEach((name: any) => {
				titleObj[name.language] = name.text;
			});
		}

		if (apiData.descriptions && Array.isArray(apiData.descriptions)) {
			apiData.descriptions.forEach((desc: any) => {
				descriptionObj[desc.language] = desc.text;
			});
		}

		return {
			id: apiData.id,
			title: titleObj,
			description: descriptionObj,
			url: apiData.url,
			order: 0,
			isActive: true
		};
	},

	transformFormToApi: (formData): LinkApiPayload => ({
		name: formData.title,
		description: formData.description,
		url: formData.url
	})
};

// Link-specific form fields (now dynamic based on global languages)
function createLinkFormFields(): FormField[] {
	return [
		{
			id: "title",
			label: "Titel",
			type: "text",
			required: true,
			multilingual: true,
			placeholder: "z.B. Startseite, Über uns, Kontakt"
		},
		{
			id: "description",
			label: "Beschreibung",
			type: "textarea",
			multilingual: true,
			placeholder: "Optionale Beschreibung des Links"
		},
		{
			id: "url",
			label: "URL",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "/about oder https://example.com",
			helpText: "Verwenden Sie relative URLs (/about) für interne Links oder vollständige URLs (https://example.com) für externe Links."
		}
	];
}

function createLinkInitialFormData() {
	return {
		title: createInitialFormDataForLanguages(),
		description: createInitialFormDataForLanguages(),
		url: "",
		order: 0,
		isActive: true
	};
}

// Link API methods - also use flexible types for consistency
const linkApiMethods = {
	list: () => trpcAuthQuery("link.list") as Promise<any[]>,
	create: (data: LinkApiPayload) => trpcAuthQuery("link.create", data),
	update: (data: LinkApiPayload & { id: number }) => trpcAuthQuery("link.update", data),
	delete: (id: number) => trpcAuthQuery("link.delete", id)
};

// Export the link helper (now dynamic)
export function createLinkHelper() {
	return createAdminEntityHelper<any, LinkFormType>({
		formFields: createLinkFormFields(),
		initialFormData: createLinkInitialFormData(),
		transformers: linkTransformers,
		apiMethods: linkApiMethods
	});
}

// Keep backward compatibility
export const linkHelper = createLinkHelper();
