import { z } from 'zod';
import prisma from '../../../../utils/db';
import type { Prisma } from '@prisma/client';

const mapTranslationsForPrisma = (translations: Record<string, string> | undefined) => {
	if (!translations) return [];
	return Object.entries(translations).map(([language, value]) => ({
		language,
		value,
	}));
};

// Helper function to get media with translated fields
async function getMediaWithTranslatedFields(
	whereClause: Prisma.MediaItemWhereUniqueInput,
	language?: string
) {
	const media = await prisma.mediaItem.findUnique({
		where: whereClause,
		include: {
			altText: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
			caption: {
				include: {
					translations: language ? { where: { language } } : true,
				},
			},
		},
	});

	if (!media) return null;

	return {
		...media,
		altText: media.altText?.translations.length ? media.altText.translations[0]?.value : null,
		caption: media.caption?.translations.length ? media.caption.translations[0]?.value : null,
	};
}

export const mediaHandlers = {
	create: async (input: z.infer<typeof createMediaSchema>) => {
		const { altTexts, captions, uploaderId, ...rest } = input;

		return await prisma.mediaItem.create({
			data: {
				...rest,
				...(altTexts && Object.keys(altTexts).length > 0 && {
					altText: {
						create: {
							translations: {
								create: mapTranslationsForPrisma(altTexts),
							},
						},
					},
				}),
				...(captions && Object.keys(captions).length > 0 && {
					caption: {
						create: {
							translations: {
								create: mapTranslationsForPrisma(captions),
							},
						},
					},
				}),
				...(uploaderId && {
					uploader: {
						connect: { id: uploaderId }
					}
				})
			},
		});
	},

	read: async (id: string, language?: string) => {
		return getMediaWithTranslatedFields({ storageKey: id }, language);
	},

	update: async (input: z.infer<typeof updateMediaSchema>) => {
		const { id, altTexts, captions, uploaderId, ...rest } = input;

		return await prisma.mediaItem.update({
			where: { storageKey: id },
			data: {
				...rest,
				...(altTexts !== undefined && {
					altText: altTexts && Object.keys(altTexts).length > 0 ? {
						upsert: {
							create: {
								translations: {
									create: mapTranslationsForPrisma(altTexts),
								},
							},
							update: {
								translations: {
									deleteMany: {},
									create: mapTranslationsForPrisma(altTexts),
								},
							},
						},
					} : {
						disconnect: true,
					},
				}),
				...(captions !== undefined && {
					caption: captions && Object.keys(captions).length > 0 ? {
						upsert: {
							create: {
								translations: {
									create: mapTranslationsForPrisma(captions),
								},
							},
							update: {
								translations: {
									deleteMany: {},
									create: mapTranslationsForPrisma(captions),
								},
							},
						},
					} : {
						disconnect: true,
					},
				}),
				...(uploaderId !== undefined && {
					uploader: uploaderId ? {
						connect: { id: uploaderId }
					} : {
						disconnect: true
					}
				})
			},
		});
	},

	delete: async (id: string) => {
		return await prisma.mediaItem.delete({ where: { storageKey: id } });
	},

	list: async (language?: string) => {
		const mediaItems = await prisma.mediaItem.findMany({
			include: {
				altText: {
					include: {
						translations: language ? { where: { language } } : true,
					},
				},
				caption: {
					include: {
						translations: language ? { where: { language } } : true,
					},
				},
			},
		});

		return mediaItems.map((media) => ({
			...media,
			altText: media.altText?.translations.length ? media.altText.translations[0]?.value : null,
			caption: media.caption?.translations.length ? media.caption.translations[0]?.value : null,
		}));
	},
};

const createMediaSchema = z.object({
	filename: z.string(),
	storageKey: z.string(),
	storageBucket: z.string(),
	storageRegion: z.string(),
	mimeType: z.string(),
	size: z.number(),
	width: z.number().optional(),
	height: z.number().optional(),
	altTexts: z.record(z.string(), z.string()).optional(),
	captions: z.record(z.string(), z.string()).optional(),
	uploaderId: z.number().optional(),
	showInMediaGallery: z.boolean().optional(),
	mediaType: z.string().optional(),
});

const updateMediaSchema = z.object({
	id: z.string(),
	filename: z.string().optional(),
	storageKey: z.string().optional(),
	storageBucket: z.string().optional(),
	storageRegion: z.string().optional(),
	mimeType: z.string().optional(),
	size: z.number().optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	altTexts: z.record(z.string(), z.string()).optional().nullable(),
	captions: z.record(z.string(), z.string()).optional().nullable(),
	uploaderId: z.number().optional(),
	showInMediaGallery: z.boolean().optional(),
	mediaType: z.string().optional(),
});
