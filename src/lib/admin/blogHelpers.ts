import type { FormField } from "@/components/ui/MultiLanguageFormModal.svelte";
import { createAdminEntityHelper, type DataTransformers } from "./createAdminHelper";
import { trpcAuthQuery } from "@/pages/api/trpc/trpc";
import { createInitialFormDataForLanguages } from "./languageConfig";

interface BlogApiType {
	id: number;
	slug: string;
	authors: string[];
	coverImageKey: string | null;
	publishedAt: Date;
	updatedAt: Date;
	title: { translations: Array<{ language: string; value: string }> };
	content: { translations: Array<{ language: string; value: string }> };
}

interface BlogFormType {
	id?: number;
	title: Record<string, string>;
	slug: string;
	authors: string; // Comma-separated string for form input
	content: Record<string, string>;
	coverImageKey: string | null;
}

interface BlogApiPayload {
	title: Record<string, string>;
	slug: string;
	authors: string[];
	content: Record<string, string>;
	coverImageKey?: string | null;
}

const blogTransformers: DataTransformers<BlogApiType, BlogFormType> = {
	transformApiToForm: (apiData) => {
		const titleObj: Record<string, string> = {};
		const contentObj: Record<string, string> = {};

		if (apiData.title && apiData.title.translations) {
			apiData.title.translations.forEach((trans) => {
				titleObj[trans.language] = trans.value;
			});
		}
		if (apiData.content && apiData.content.translations) {
			apiData.content.translations.forEach((trans) => {
				contentObj[trans.language] = trans.value;
			});
		}

		return {
			id: apiData.id,
			title: titleObj,
			slug: apiData.slug,
			authors: Array.isArray(apiData.authors) ? apiData.authors.join(", ") : "",
			content: contentObj,
			coverImageKey: apiData.coverImageKey || null,
		};
	},
	transformFormToApi: (formData): BlogApiPayload => ({
		title: formData.title,
		slug: formData.slug,
		authors: formData.authors.split(",").map(author => author.trim()).filter(author => author),
		content: formData.content,
		coverImageKey: formData.coverImageKey,
	}),
};

function createBlogFormFields(): FormField[] {
	return [
		{
			id: "title",
			label: "Titel",
			type: "text",
			required: true,
			multilingual: true,
			placeholder: "Blog-Titel",
		},
		{
			id: "slug",
			label: "Slug",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "eindeutiger-blog-slug",
			helpText: "Wird für die URL verwendet. Nur Kleinbuchstaben, Zahlen und Bindestriche.",
		},
		{
			id: "authors",
			label: "Autoren",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "Max Mustermann, Erika Mustermann",
			helpText: "Mehrere Autoren mit Komma trennen.",
		},
		{
			id: "content",
			label: "Inhalt",
			type: "textarea",
			required: true,
			multilingual: true,
			placeholder: "Schreiben Sie hier Ihren Blog-Inhalt...",
		},
		{
			id: "coverImageKey",
			label: "Titelbild",
			type: "text", // Will use FileManagerSelect
			required: false,
			multilingual: false,
			placeholder: "Bild aus Dateimanager auswählen...",
			useFileManager: true,
		},
	];
}

function createBlogInitialFormData(): BlogFormType {
	return {
		title: createInitialFormDataForLanguages(),
		slug: "",
		authors: "",
		content: createInitialFormDataForLanguages(),
		coverImageKey: null,
	};
}

const blogApiMethods = {
	list: () => trpcAuthQuery("blog.list") as Promise<BlogApiType[]>,
	create: (data: BlogApiPayload) => trpcAuthQuery("blog.create", data),
	update: (data: BlogApiPayload & { id: number }) => trpcAuthQuery("blog.update", data),
	delete: (id: number) => trpcAuthQuery("blog.delete", id),
};

export function createBlogHelper() {
	return createAdminEntityHelper<BlogApiType, BlogFormType>({
		formFields: createBlogFormFields(),
		initialFormData: createBlogInitialFormData(),
		transformers: blogTransformers,
		apiMethods: blogApiMethods,
	});
}

export const blogHelper = createBlogHelper();
