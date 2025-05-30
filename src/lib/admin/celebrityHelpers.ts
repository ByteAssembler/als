import type { FormField } from "../../components/ui/MultiLanguageFormModal.svelte";
import { createAdminEntityHelper, type DataTransformers } from "./createAdminHelper.js";
import { trpcAuthQuery } from "../../pages/api/trpc/trpc.js";
import { createInitialFormDataForLanguages } from "./languageConfig.js";

// Celebrity-specific types
interface CelebrityApiType {
	id: number;
	name: string;
	imageKey?: string;
	born: string;
	died?: string;
	alsYear: number;
	bios?: Array<{ text: string; language: string }>;
	professions?: Array<{ text: string; language: string }>;
}

interface CelebrityFormType {
	id?: number;
	name: string;
	bio: Record<string, string>;
	profession: Record<string, string>;
	imageKey?: string;
	born: string;
	died?: string;
	alsYear: number;
}

interface CelebrityApiPayload {
	name: string;
	bios: Record<string, string>;
	professions: Record<string, string>;
	image?: string;
	born: string;
	died?: string;
	alsYear: number;
}

// Celebrity-specific transformers
const celebrityTransformers: DataTransformers<any, CelebrityFormType> = {
	transformApiToForm: (apiData: any) => {
		const bioObj: Record<string, string> = {};
		const professionObj: Record<string, string> = {};

		// Handle API format
		if (apiData.bios && Array.isArray(apiData.bios)) {
			apiData.bios.forEach((bio: any) => {
				bioObj[bio.language] = bio.text;
			});
		}

		if (apiData.professions && Array.isArray(apiData.professions)) {
			apiData.professions.forEach((profession: any) => {
				professionObj[profession.language] = profession.text;
			});
		}

		return {
			id: apiData.id,
			name: apiData.name || "",
			bio: bioObj,
			profession: professionObj,
			imageKey: apiData.imageKey,
			born: apiData.born ? new Date(apiData.born).toISOString().split('T')[0] : "",
			died: apiData.died ? new Date(apiData.died).toISOString().split('T')[0] : "",
			alsYear: apiData.alsYear || new Date().getFullYear()
		};
	},

	transformFormToApi: (formData): CelebrityApiPayload => ({
		name: formData.name,
		bios: formData.bio,
		professions: formData.profession,
		image: formData.imageKey,
		born: formData.born ? new Date(formData.born).toISOString() : new Date().toISOString(),
		died: formData.died ? new Date(formData.died).toISOString() : undefined,
		alsYear: formData.alsYear
	})
};

// Celebrity-specific form fields
function createCelebrityFormFields(): FormField[] {
	return [
		{
			id: "name",
			label: "Name",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "Vollständiger Name der Persönlichkeit"
		},
		{
			id: "bio",
			label: "Biografie",
			type: "textarea",
			required: true,
			multilingual: true,
			placeholder: "Biografie der Persönlichkeit"
		},
		{
			id: "profession",
			label: "Beruf",
			type: "text",
			required: true,
			multilingual: true,
			placeholder: "Beruf oder Tätigkeit"
		},
		{
			id: "born",
			label: "Geburtsdatum",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "YYYY-MM-DD",
			helpText: "Geburtsdatum im Format YYYY-MM-DD"
		},
		{
			id: "died",
			label: "Sterbedatum",
			type: "text",
			required: false,
			multilingual: false,
			placeholder: "YYYY-MM-DD (optional)",
			helpText: "Sterbedatum im Format YYYY-MM-DD (falls verstorben)"
		},
		{
			id: "alsYear",
			label: "ALS Jahr",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "Jahr der ALS-Relevanz"
		},
		{
			id: "imageKey",
			label: "Bild",
			type: "text",
			required: false,
			multilingual: false,
			placeholder: "Bild auswählen...",
			helpText: "Wählen Sie ein Bild aus dem File Manager oder geben Sie eine URL ein",
			// Mark this field as requiring file manager data
			useFileManager: true
		}
	];
}

function createCelebrityInitialFormData() {
	return {
		name: "",
		bio: createInitialFormDataForLanguages(),
		profession: createInitialFormDataForLanguages(),
		imageKey: "",
		born: "",
		died: "",
		alsYear: new Date().getFullYear()
	};
}

// Celebrity API methods
const celebrityApiMethods = {
	list: () => trpcAuthQuery("celebrity.list") as Promise<any[]>,
	create: (data: CelebrityApiPayload) => trpcAuthQuery("celebrity.create", data),
	update: (data: CelebrityApiPayload & { id: number }) => trpcAuthQuery("celebrity.update", data),
	delete: (id: number) => trpcAuthQuery("celebrity.delete", id)
};

// Export the celebrity helper
export function createCelebrityHelper() {
	return createAdminEntityHelper<any, CelebrityFormType>({
		formFields: createCelebrityFormFields(),
		initialFormData: createCelebrityInitialFormData(),
		transformers: celebrityTransformers,
		apiMethods: celebrityApiMethods
	});
}

export const celebrityHelper = createCelebrityHelper();
