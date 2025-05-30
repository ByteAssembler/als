import type { FormField } from "../../components/ui/MultiLanguageFormModal.svelte";
import { createAdminEntityHelper, type DataTransformers } from "./createAdminHelper";
import { trpcAuthQuery } from "../../pages/api/trpc/trpc";
import { createInitialFormDataForLanguages } from "./languageConfig";

// MapPointCategory types
interface MapPointCategoryApiType {
	id: number;
	names?: Array<{ text: string; language: string }>;
}

interface MapPointCategoryFormType {
	id?: number;
	name: Record<string, string>;
}

interface MapPointCategoryApiPayload {
	names: Record<string, string>;
}

// MapPoint types
interface MapPointApiType {
	id: number;
	latitude: number;
	longitude: number;
	categoryId: number;
	names?: Array<{ text: string; language: string }>;
	descriptions?: Array<{ text: string; language: string }>;
	category?: {
		id: number;
		names?: Array<{ text: string; language: string }>;
	};
}

interface MapPointFormType {
	id?: number;
	name: Record<string, string>;
	description: Record<string, string>;
	categoryId: number;
	latitude: number;
	longitude: number;
}

interface MapPointApiPayload {
	names: Record<string, string>;
	descriptions: Record<string, string>;
	categoryId: number;
	latitude: number;
	longitude: number;
}

// MapPoint transformers
const mapPointTransformers: DataTransformers<any, MapPointFormType> = {
	transformApiToForm: (apiData: any) => {
		const nameObj: Record<string, string> = {};
		const descriptionObj: Record<string, string> = {};

		// Handle API format - both arrays and single language formats
		if (apiData.names && Array.isArray(apiData.names)) {
			apiData.names.forEach((name: any) => {
				nameObj[name.language] = name.text;
			});
		}

		if (apiData.descriptions && Array.isArray(apiData.descriptions)) {
			apiData.descriptions.forEach((desc: any) => {
				descriptionObj[desc.language] = desc.text;
			});
		}

		return {
			id: apiData.id,
			name: nameObj,
			description: descriptionObj,
			categoryId: String(apiData.categoryId || 0), // Fix: Convert to string for select field
			latitude: Number(apiData.latitude) || 0,
			longitude: Number(apiData.longitude) || 0
		};
	},

	transformFormToApi: (formData): MapPointApiPayload => ({
		names: formData.name,
		descriptions: formData.description,
		categoryId: Number(formData.categoryId),
		latitude: Number(formData.latitude),
		longitude: Number(formData.longitude)
	})
};

// MapPointCategory transformers - fix for proper data mapping
const mapPointCategoryTransformers: DataTransformers<any, MapPointCategoryFormType> = {
	transformApiToForm: (apiData: any) => {
		const nameObj: Record<string, string> = {};

		// Handle API format - both arrays and single language formats
		if (apiData.names && Array.isArray(apiData.names)) {
			apiData.names.forEach((name: any) => {
				nameObj[name.language] = name.text;
			});
		}

		return {
			id: apiData.id,
			name: nameObj
		};
	},

	transformFormToApi: (formData): MapPointCategoryApiPayload => ({
		names: formData.name
	})
};

// Form fields for categories
function createMapPointCategoryFormFields(): FormField[] {
	return [
		{
			id: "name",
			label: "Kategorie-Name",
			type: "text",
			required: true,
			multilingual: true,
			placeholder: "z.B. Kliniken, Selbsthilfegruppen, Vereine"
		}
	];
}

// Form fields for map points
function createMapPointFormFields(): FormField[] {
	return [
		{
			id: "name",
			label: "Name",
			type: "text",
			required: true,
			multilingual: true,
			placeholder: "Name des Ortes/der Einrichtung"
		},
		{
			id: "description",
			label: "Beschreibung",
			type: "textarea",
			required: false,
			multilingual: true,
			placeholder: "Zusätzliche Informationen zum Ort"
		},
		{
			id: "categoryId",
			label: "Kategorie",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "Kategorie-ID auswählen",
			helpText: "Wählen Sie eine Kategorie für diesen Punkt"
		},
		{
			id: "latitude",
			label: "Breitengrad",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "z.B. 46.7419",
			helpText: "Geografischer Breitengrad (Latitude)"
		},
		{
			id: "longitude",
			label: "Längengrad",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "z.B. 12.0196",
			helpText: "Geografischer Längengrad (Longitude)"
		}
	];
}

// Initial form data functions
function createMapPointCategoryInitialFormData() {
	return {
		name: createInitialFormDataForLanguages()
	};
}

function createMapPointInitialFormData() {
	return {
		name: createInitialFormDataForLanguages(),
		description: createInitialFormDataForLanguages(),
		categoryId: 0,
		latitude: 0,
		longitude: 0
	};
}

// API methods for categories
const mapPointCategoryApiMethods = {
	list: () => trpcAuthQuery("mapPointCategory.list") as Promise<any[]>,
	create: (data: MapPointCategoryApiPayload) => trpcAuthQuery("mapPointCategory.create", data),
	update: (data: MapPointCategoryApiPayload & { id: number }) => trpcAuthQuery("mapPointCategory.update", data),
	delete: (id: number) => trpcAuthQuery("mapPointCategory.delete", id)
};

// API methods for map points
const mapPointApiMethods = {
	list: () => trpcAuthQuery("mapPoint.list") as Promise<any[]>,
	create: (data: MapPointApiPayload) => trpcAuthQuery("mapPoint.create", data),
	update: (data: MapPointApiPayload & { id: number }) => trpcAuthQuery("mapPoint.update", data),
	delete: (id: number) => trpcAuthQuery("mapPoint.delete", id)
};

// Export helpers
export function createMapPointCategoryHelper() {
	return createAdminEntityHelper<any, MapPointCategoryFormType>({
		formFields: createMapPointCategoryFormFields(),
		initialFormData: createMapPointCategoryInitialFormData(),
		transformers: mapPointCategoryTransformers,
		apiMethods: mapPointCategoryApiMethods
	});
}

export function createMapPointHelper() {
	return createAdminEntityHelper<any, MapPointFormType>({
		formFields: createMapPointFormFields(),
		initialFormData: createMapPointInitialFormData(),
		transformers: mapPointTransformers,
		apiMethods: mapPointApiMethods
	});
}

export const mapPointCategoryHelper = createMapPointCategoryHelper();
export const mapPointHelper = createMapPointHelper();
