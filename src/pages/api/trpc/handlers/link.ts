import { z } from 'zod';
import prisma from '../../../../utils/db';

export const linkHandlers = {
	findAll: async () => {
		return await prisma.link.findMany();
	},
	create: async (input: z.infer<typeof createLinkSchema>) => {
		// Create name translation
		const nameRawTranslation = await prisma.rawTranslation.create({
			data: {
				translations: {
					create: Object.entries(input.name).map(([language, value]) => ({
						language,
						value: value as string,
					})),
				},
			},
		});

		// Create description translation if provided
		let descriptionRawTranslationId = null;
		if (input.description && Object.keys(input.description).length > 0) {
			const descriptionRawTranslation = await prisma.rawTranslation.create({
				data: {
					translations: {
						create: Object.entries(input.description).map(([language, value]) => ({
							language,
							value: value as string,
						})),
					},
				},
			});
			descriptionRawTranslationId = descriptionRawTranslation.id;
		}

		// Create the link
		return await prisma.link.create({
			data: {
				nameRawTranslationId: nameRawTranslation.id,
				descriptionRawTranslationId,
				url: input.url,
			},
		});
	},
	read: async (id: number, language?: string) => {
		const link = await prisma.link.findUnique({
			where: { id },
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				description: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!link) {
			return null;
		}

		const name = link.name.translations.length > 0 ? link.name.translations[0].value : null;
		const description = link.description?.translations && link.description.translations.length > 0
			? link.description.translations[0].value
			: null;

		return {
			...link,
			name: name,
			description: description,
		};
	},
	read_by_language: async (id: number, language: string) => {
		const link = await prisma.link.findUnique({
			where: { id },
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				description: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!link) {
			return null;
		}

		const name = link.name.translations.length > 0 ? link.name.translations[0].value : null;
		const description = link.description?.translations && link.description.translations.length > 0
			? link.description.translations[0].value
			: null;

		return {
			...link,
			name: name,
			description: description,
		};
	},
	update: async (input: z.infer<typeof updateLinkSchema>) => {
		// Find the link to update
		const link = await prisma.link.findUnique({
			where: { id: input.id },
		});

		if (!link) {
			throw new Error('Link not found');
		}

		const updateData: any = {};

		// Update name translations if provided
		if (input.name) {
			for (const [language, value] of Object.entries(input.name)) {
				await prisma.translation.upsert({
					where: {
						language_rawTranslationId: {
							language,
							rawTranslationId: link.nameRawTranslationId,
						},
					},
					update: { value: value as string },
					create: {
						language,
						value: value as string,
						rawTranslationId: link.nameRawTranslationId,
					},
				});
			}
		}

		// Update description translations if provided
		if (input.description !== undefined) {
			if (input.description && Object.keys(input.description).length > 0) {
				if (link.descriptionRawTranslationId) {
					// Update existing description translations
					for (const [language, value] of Object.entries(input.description)) {
						await prisma.translation.upsert({
							where: {
								language_rawTranslationId: {
									language,
									rawTranslationId: link.descriptionRawTranslationId,
								},
							},
							update: { value: value as string },
							create: {
								language,
								value: value as string,
								rawTranslationId: link.descriptionRawTranslationId,
							},
						});
					}
				} else {
					// Create new description translation
					const descriptionRawTranslation = await prisma.rawTranslation.create({
						data: {
							translations: {
								create: Object.entries(input.description).map(([language, value]) => ({
									language,
									value: value as string,
								})),
							},
						},
					});
					updateData.descriptionRawTranslationId = descriptionRawTranslation.id;
				}
			} else if (link.descriptionRawTranslationId) {
				// Remove description if set to null/empty
				await prisma.rawTranslation.delete({
					where: { id: link.descriptionRawTranslationId },
				});
				updateData.descriptionRawTranslationId = null;
			}
		}

		// Update URL if provided
		if (input.url !== undefined) {
			updateData.url = input.url;
		}

		// Update the link if there are changes
		if (Object.keys(updateData).length > 0) {
			return await prisma.link.update({
				where: { id: input.id },
				data: updateData,
			});
		}

		return link;
	},
	delete: async (id: number) => {
		// The translations will be deleted automatically due to onDelete: Cascade
		return await prisma.link.delete({ where: { id } });
	},
	list: async (language?: string) => {
		const links = await prisma.link.findMany({
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				description: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!links || links.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		links.forEach((link) => {
			rawTranslationIds.push(link.nameRawTranslationId);
			if (link.descriptionRawTranslationId) {
				rawTranslationIds.push(link.descriptionRawTranslationId);
			}
		});

		const translationRecords = await prisma.rawTranslation.findMany({
			where: {
				id: {
					in: rawTranslationIds,
				},
			},
			include: {
				translations: {
					where: {
						language: language,
					},
				},
			},
		});

		const translations = translationRecords.reduce((acc: { [key: number]: string | null }, record) => {
			acc[record.id] = record.translations.length > 0 ? record.translations[0].value : null;
			return acc;
		}, {});

		return links.map((link) => {
			const name = translations[link.nameRawTranslationId];
			const description = link.descriptionRawTranslationId ? translations[link.descriptionRawTranslationId] : null;

			return {
				...link,
				name: name ?? link.name.translations[0]?.value,
				description: description ?? link.description?.translations[0]?.value ?? null,
			};
		});
	},
	list_by_language: async (language: string) => {
		const links = await prisma.link.findMany({
			include: {
				name: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
				description: {
					include: {
						translations: {
							where: { language: language },
						},
					},
				},
			},
		});

		if (!links || links.length === 0) {
			return [];
		}

		const rawTranslationIds: number[] = [];
		links.forEach((link) => {
			rawTranslationIds.push(link.nameRawTranslationId);
			if (link.descriptionRawTranslationId) {
				rawTranslationIds.push(link.descriptionRawTranslationId);
			}
		});

		const translationRecords = await prisma.rawTranslation.findMany({
			where: {
				id: {
					in: rawTranslationIds,
				},
			},
			include: {
				translations: {
					where: {
						language: language,
					},
				},
			},
		});

		const translations = translationRecords.reduce((acc: { [key: number]: string | null }, record) => {
			acc[record.id] = record.translations.length > 0 ? record.translations[0].value : null;
			return acc;
		}, {});

		return links.map((link) => {
			const name = translations[link.nameRawTranslationId];
			const description = link.descriptionRawTranslationId ? translations[link.descriptionRawTranslationId] : null;

			return {
				...link,
				name: name ?? link.name.translations[0]?.value,
				description: description ?? link.description?.translations[0]?.value ?? null,
			};
		});
	},
};

const createLinkSchema = z.object({
	name: z.record(z.string(), z.string()),
	description: z.record(z.string(), z.string()).optional(),
	url: z.string().url(),
});

const updateLinkSchema = z.object({
	id: z.number(),
	name: z.record(z.string(), z.string()).optional(),
	description: z.record(z.string(), z.string()).optional().nullable(),
	url: z.string().url().optional(),
});
