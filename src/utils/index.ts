import prisma from './db';

export const getTranslation = async (rawTranslationId: number, language: string) => {
	const translation = await prisma.rawTranslation.findUnique({
		where: { id: rawTranslationId },
		include: {
			translations: {
				where: { language: language },
			},
		},
	});

	if (translation && translation.translations.length > 0) {
		return translation.translations[0].value;
	}

	return null;
};
