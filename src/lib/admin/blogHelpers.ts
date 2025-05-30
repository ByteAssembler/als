import type { FormField } from "../../components/ui/MultiLanguageFormModal.svelte";
import { createAdminEntityHelper, type DataTransformers } from "./createAdminHelper.js";
import { trpcAuthQuery } from "../../pages/api/trpc/trpc.js";
import { createInitialFormDataForLanguages } from "./languageConfig.js";

// Blog-specific types - updated to match actual API response
interface BlogApiType {
	id: number;
	slug: string;
	published?: boolean;
	authors?: string[];
	coverImage?: string;
	titles?: Array<{ text: string; language: string }>;
	contents?: Array<{ text: string; language: string }>;
	// Additional fields that might come from the API
	title?: any;
	content?: any;
	createdAt?: Date;
	updatedAt?: Date;
	[key: string]: any; // Allow additional fields from API
}

interface BlogFormType {
	id?: number;
	title: Record<string, string>;
	content: Record<string, string>;
	slug: string;
	published: boolean;
	authors: string[];
	coverImage?: string;
}

interface BlogApiPayload {
	title?: Record<string, string>;
	content?: Record<string, string>;
	slug: string;
	published: boolean;
	authors: string[];
	coverImage?: string;
}

// Blog-specific transformers - handle flexible API response
const blogTransformers: DataTransformers<any, BlogFormType> = {
	transformApiToForm: (apiData: any) => {
		const titleObj: Record<string, string> = {};
		const contentObj: Record<string, string> = {};

		// Handle both API format variations
		if (apiData.titles && Array.isArray(apiData.titles)) {
			apiData.titles.forEach((title: any) => {
				titleObj[title.language] = title.text;
			});
		}

		if (apiData.contents && Array.isArray(apiData.contents)) {
			apiData.contents.forEach((content: any) => {
				contentObj[content.language] = content.text;
			});
		}

		return {
			id: apiData.id,
			title: titleObj,
			content: contentObj,
			slug: apiData.slug || "",
			published: apiData.published || false,
			authors: apiData.authors || [],
			coverImage: apiData.coverImage
		};
	},

	transformFormToApi: (formData): BlogApiPayload => ({
		title: formData.title,
		content: formData.content,
		slug: formData.slug,
		published: formData.published,
		authors: formData.authors,
		coverImage: formData.coverImage
	})
};

// Blog-specific form fields
function createBlogFormFields(): FormField[] {
	return [
		{
			id: "title",
			label: "Titel",
			type: "text",
			required: true,
			multilingual: true,
			placeholder: "Blog-Titel eingeben"
		},
		{
			id: "content",
			label: "Inhalt",
			type: "textarea",
			required: true,
			multilingual: true,
			placeholder: "Blog-Inhalt eingeben"
		},
		{
			id: "slug",
			label: "URL-Slug",
			type: "text",
			required: true,
			multilingual: false,
			placeholder: "url-freundlicher-slug",
			helpText: "Eindeutiger URL-Slug für den Blog-Post"
		},
		{
			id: "published",
			label: "Veröffentlicht",
			type: "checkbox",
			multilingual: false
		}
	];
}

function createBlogInitialFormData() {
	return {
		title: createInitialFormDataForLanguages(),
		content: createInitialFormDataForLanguages(),
		slug: "",
		published: false,
		authors: [],
		coverImage: ""
	};
}

// Blog API methods - use flexible types to handle actual API response
const blogApiMethods = {
	list: () => trpcAuthQuery("blog.list") as Promise<any[]>, // Cast to any[] to handle flexible response
	create: (data: BlogApiPayload) => trpcAuthQuery("blog.create", data),
	update: (data: BlogApiPayload & { id: number }) => trpcAuthQuery("blog.update", data),
	delete: (id: number) => trpcAuthQuery("blog.delete", id)
};

// Export the blog helper
export function createBlogHelper() {
	return createAdminEntityHelper<any, BlogFormType>({
		formFields: createBlogFormFields(),
		initialFormData: createBlogInitialFormData(),
		transformers: blogTransformers,
		apiMethods: blogApiMethods
	});
}

export const blogHelper = createBlogHelper();
