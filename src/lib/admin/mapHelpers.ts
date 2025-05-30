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
	categoryId: string; // Fix: Change to string for form compatibility
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

		if (apiData.name && apiData.name.translations && Array.isArray(apiData.name.translations)) {
			apiData.name.translations.forEach((trans: { language: string; value: string }) => {
				nameObj[trans.language] = trans.value;
			});
		} else if (apiData.names && Array.isArray(apiData.names)) { // Fallback
			apiData.names.forEach((item: any) => nameObj[item.language] = item.text || item.value);
		}

		if (apiData.description && apiData.description.translations && Array.isArray(apiData.description.translations)) {
			apiData.description.translations.forEach((trans: { language: string; value: string }) => {
				descriptionObj[trans.language] = trans.value;
			});
		} else if (apiData.descriptions && Array.isArray(apiData.descriptions)) { // Fallback
			apiData.descriptions.forEach((item: any) => descriptionObj[item.language] = item.text || item.value);
		}

		let transformedCategory: { id: number; name: Record<string, string> } | undefined = undefined;
		if (apiData.category) {
			const categoryNameObj: Record<string, string> = {};
			if (apiData.category.name && apiData.category.name.translations && Array.isArray(apiData.category.name.translations)) {
				apiData.category.name.translations.forEach((trans: { language: string; value: string }) => {
					categoryNameObj[trans.language] = trans.value;
				});
			} else if (apiData.category.names && Array.isArray(apiData.category.names)) { // Fallback for category names
				apiData.category.names.forEach((item: any) => categoryNameObj[item.language] = item.text || item.value);
			}
			transformedCategory = {
				id: apiData.category.id,
				name: categoryNameObj,
			};
		}

		return {
			id: apiData.id,
			name: nameObj,
			description: descriptionObj,
			categoryId: String(apiData.categoryId || ""),
			latitude: Number(apiData.latitude) || 0,
			longitude: Number(apiData.longitude) || 0,
			// Store the fully transformed category object if available
			// This is used by mapPointTableData in Map.svelte
			category: transformedCategory,
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

		if (apiData.name && apiData.name.translations && Array.isArray(apiData.name.translations)) {
			apiData.name.translations.forEach((trans: { language: string; value: string }) => {
				nameObj[trans.language] = trans.value;
			});
		} else if (apiData.names && Array.isArray(apiData.names)) { // Fallback
			apiData.names.forEach((item: any) => nameObj[item.language] = item.text || item.value);
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
			type: "select", // Fix: Change to select type
			required: true,
			multilingual: false,
			placeholder: "Kategorie auswählen",
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
		categoryId: "", // Fix: Change to empty string
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
