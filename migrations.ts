import { PrismaClient, Role } from "@prisma/client";
import path from "path"; // For basename and extname

const prisma = new PrismaClient();

// --- Helper function to create RawTranslation and its Translations ---
async function createRawTranslationWithData(translations: { [lang: string]: string }): Promise<number> {
	if (Object.keys(translations).length === 0) {
		// Create an empty raw translation if no translations are provided.
		// This is for optional fields that might legitimately have no translations.
		const rawT = await prisma.rawTranslation.create({ data: {} });
		return rawT.id;
	}
	const rawTranslation = await prisma.rawTranslation.create({
		data: {
			translations: {
				create: Object.entries(translations).map(([language, value]) => ({
					language,
					value,
				})),
			},
		},
	});
	return rawTranslation.id;
}

// --- Helper function to create MediaItem ---
// Cache maps storageKey -> storageKey (the new ID)
const mediaItemCache = new Map<string, string>();

async function createMediaItemEntry(
	filePath: string | null,
	uploaderId: number | null,
	altTextTranslations: { [lang: string]: string } = {},
	captionTranslations: { [lang: string]: string } = {}
): Promise<string | null> {
	if (!filePath || filePath === '\\N' || filePath.trim() === '') {
		return null;
	}

	const filename = path.basename(filePath);
	const storageKey = `migrated${filePath.startsWith('/') ? '' : '/'}${filePath.replace(/\s/g, '_')}`;

	if (mediaItemCache.has(storageKey)) {
		return mediaItemCache.get(storageKey)!;
	}

<<<<<<< HEAD
	let mimeType = 'application/octet-stream';
	const ext = path.extname(filename).toLowerCase();
	if (ext === '.png') mimeType = 'image/png';
	else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
	else if (ext === '.webp') mimeType = 'image/webp';

	const altTextRawId = Object.keys(altTextTranslations).length > 0 ? await createRawTranslationWithData(altTextTranslations) : undefined;
	const captionRawId = Object.keys(captionTranslations).length > 0 ? await createRawTranslationWithData(captionTranslations) : undefined;

	try {
		const mediaItem = await prisma.mediaItem.upsert({
			where: { storageKey },
=======
  let mimeType = "application/octet-stream";
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") mimeType = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
  else if (ext === ".webp") mimeType = "image/webp";

  const altTextRawId =
    Object.keys(altTextTranslations).length > 0 ? await createRawTranslationWithData(altTextTranslations) : undefined;
  const captionRawId =
    Object.keys(captionTranslations).length > 0 ? await createRawTranslationWithData(captionTranslations) : undefined;

  try {
    const mediaItem = await prisma.mediaItem.upsert({
      where: { storageKey }, // Use storageKey for upsert where clause
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			update: {
				filename,
				mimeType,
				uploaderId,
				altTextRawTranslationId: altTextRawId,
				captionRawTranslationId: captionRawId,
			},
			create: {
<<<<<<< HEAD
				filename,
				storageKey,
				storageBucket: 'migrated-bucket',
				storageRegion: 'migrated-region',
				mimeType,
				size: 0,
				width: null,
				height: null,
=======
        storageKey, // storageKey is now the ID
        filename,
        mimeType,
        size: 0, // Dummy
        width: null, // Dummy
        height: null, // Dummy
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
				altTextRawTranslationId: altTextRawId,
				captionRawTranslationId: captionRawId,
				uploaderId: uploaderId,
				showInMediaGallery: true,
<<<<<<< HEAD
				mediaType: mimeType.startsWith('image/') ? 'image' : 'file',
			},
		});
		mediaItemCache.set(storageKey, mediaItem.id);
		return mediaItem.id;
=======
        mediaType: mimeType.startsWith("image/") ? "image" : "file",
      },
    });
    mediaItemCache.set(storageKey, mediaItem.storageKey); // Cache the storageKey
    return mediaItem.storageKey;
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
	} catch (error) {
		console.error(`Error creating/upserting media item for ${filePath}:`, error);
		return null;
	}
}

async function main() {
<<<<<<< HEAD
	console.log('Starting hardcoded data migration...');

	const cvalsAdminUser = await prisma.user.upsert({
		where: { email: 'cvals_admin@example.com' },
		update: {},
		create: {
			name: 'cvals_admin',
			email: 'cvals_admin@example.com',
			passwordHash: '$2b$10$pvxxJnoP2JLCqe1Sz9/o7uf9H0YF4Ve1NRf.Ci2rIGz4WHhUwUGW',
			role: Role.SUPERADMIN,
			createdAt: new Date('2025-02-24 10:10:54.915'),
			updatedAt: new Date('2025-02-24 10:10:54.915'),
=======
  console.log("Starting hardcoded data migration...");

  // --- 1. Users (from old Admin) ---
  const cvalsAdminUser = await prisma.user.upsert({
    where: { email: "cvals_admin@example.com" },
    update: {},
    create: {
      name: "cvals_admin",
      email: "cvals_admin@example.com",
      passwordHash: "$2b$10$pvxxJnoP2JLCqe1Sz9/o7uf9Hh0YF4Ve1NRf.Ci2rIGz4WHhUwUGW",
      role: Role.SUPERADMIN,
      createdAt: new Date("2025-02-24 10:10:54.915"),
      updatedAt: new Date("2025-02-24 10:10:54.915"),
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		},
	});
	const defaultUploaderId = cvalsAdminUser.id;
	const defaultAuthorName = cvalsAdminUser.name;
	console.log(`Upserted User: ${cvalsAdminUser.name}`);

<<<<<<< HEAD
	const bookCoverPaths = [
		"13.1 In der Überlebensfalle.png", "13.2 In der Überlebensfalle Autoren.png", "14.1 Dieses Buch ist geblieben.jpg",
		"14.2 Dieses Buch ist geblieben Vorwort.png", "15.1 Dienstags bei Morrie.jpg", "15.2 Dienstags bei Morrie gelb.jpg",
		"15.3 Dienstags bei Morrie gelb.png", "18.1 Gestohlene Zeit - Eine Liebeserklärung.png",
		"18.2 Gestohlene Zeit Rezensionen - Eine Liebeserklärung.jpg", "19.1 Geschenkte Lebensjahre.png",
		"20.1 Bis zum letzten Atemzug.jpg", "20.2 Bis zum letzten Atemzug.png", "21.1 Nur ein Funken Hoffnung.jpg",
		"22.1 Leben und gleichzeitig sterben.jpg", "22.2 Leben und gleichzeitig sterben.png",
		"23.1 Bevor ich gehe - Für meine Kinder.jpg", "23.2 Bevor ich gehe - Für meine Kinder.png",
		"24.1 Bevor ich gehe - Erinnerungen.jpg", "24.2 Bevor ich gehe - Erinnerungen.png",
		"3.1 Das Jahr ohne Worte.png", "3.2 Das Jahr ohne Worte.png", "4.1 Ich will noch leben bevor ich sterbe.png",
		"4.2 Ich will noch leben bevor ich sterbe.png", "5.1 Such dir einen schönen Stern am Himmel.jpg",
		"5.2 Such dir einen schönen Stern am Himmel.png", "6a Wer stirbt denn nicht.jpg", "6b.1 Wer stirbt denn nicht.jpg",
		"6b.2 Wer stirbt denn nicht.jpg", "7.1 Zu den Ursprüngen oder Emil und die Weberknechte.jpg",
		"10.1 Ich bin eine Insel Gefangen im eigenen Körper.jpg", "10.2 Ich bin eine Insel Gefangen im eigenen Körper.jpg",
		"11.1 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.png", "7.2 Zu den Ursprüngen oder Emil und die Weberknechte.png",
		"9.1 Sinn des Lesens.jpg", "9.2 Sinn des Lesens.png",
		"8.2 Die Weisheit meines Gartens Wie die Natur mich lehrte worauf es am Ende ankommt im Leben.png",
		"17.2 Atemlos Autorin.jpg", "16.2 Weisheit des Lebens.jpg", "16.1 Weisheit des Lebens.jpg",
		"22.1 Rose und Gebrochen Deutsch.jpg", "11.2 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.jpg",
		"11.3 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.png", "12.1 Am Leben sein.jpg", "12.2 Am Leben sein.jpg",
=======
  // --- Pre-create all MediaItems ---
  // This ensures that when we try to link them later, they already exist.
  const bookCoverPaths = [
    "13.1 In der Überlebensfalle.png",
    "13.2 In der Überlebensfalle Autoren.png",
    "14.1 Dieses Buch ist geblieben.jpg",
    "14.2 Dieses Buch ist geblieben Vorwort.png",
    "15.1 Dienstags bei Morrie.jpg",
    "15.2 Dienstags bei Morrie gelb.jpg",
    "15.3 Dienstags bei Morrie gelb.png",
    "18.1 Gestohlene Zeit - Eine Liebeserklärung.png",
    "18.2 Gestohlene Zeit Rezensionen - Eine Liebeserklärung.jpg",
    "19.1 Geschenkte Lebensjahre.png",
    "20.1 Bis zum letzten Atemzug.jpg",
    "20.2 Bis zum letzten Atemzug.png",
    "21.1 Nur ein Funken Hoffnung.jpg",
    "22.1 Leben und gleichzeitig sterben.jpg",
    "22.2 Leben und gleichzeitig sterben.png",
    "23.1 Bevor ich gehe - Für meine Kinder.jpg",
    "23.2 Bevor ich gehe - Für meine Kinder.png",
    "24.1 Bevor ich gehe - Erinnerungen.jpg",
    "24.2 Bevor ich gehe - Erinnerungen.png", // Duplicate filename "24.2 Bevor ich gehe - Erinnerungen.png" for book 24 (Christian Bär) in old dump, but should be unique storageKey for new schema
    "3.1 Das Jahr ohne Worte.png",
    "3.2 Das Jahr ohne Worte.png",
    "4.1 Ich will noch leben bevor ich sterbe.png",
    "4.2 Ich will noch leben bevor ich sterbe.png",
    "5.1 Such dir einen schönen Stern am Himmel.jpg",
    "5.2 Such dir einen schönen Stern am Himmel.png",
    "6a Wer stirbt denn nicht.jpg",
    "6b.1 Wer stirbt denn nicht.jpg",
    "6b.2 Wer stirbt denn nicht.jpg",
    "7.1 Zu den Ursprüngen oder Emil und die Weberknechte.jpg",
    "10.1 Ich bin eine Insel Gefangen im eigenen Körper.jpg",
    "10.2 Ich bin eine Insel Gefangen im eigenen Körper.jpg",
    "11.1 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.png",
    "7.2 Zu den Ursprüngen oder Emil und die Weberknechte.png",
    "9.1 Sinn des Lesens.jpg",
    "9.2 Sinn des Lesens.png",
    "8.2 Die Weisheit meines Gartens Wie die Natur mich lehrte worauf es am Ende ankommt im Leben.png",
    "17.2 Atemlos Autorin.jpg",
    "16.2 Weisheit des Lebens.jpg",
    "16.1 Weisheit des Lebens.jpg",
    "22.1 Rose und Gebrochen Deutsch.jpg",
    "11.2 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.jpg",
    "11.3 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.png",
    "12.1 Am Leben sein.jpg",
    "12.2 Am Leben sein.jpg",
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
	];
	const celebrityImagePaths = ["/avatar.png"];
	const postCoverImagePaths = ["/placeholder.webp"];

	const allImagePaths = [...new Set([...bookCoverPaths, ...celebrityImagePaths, ...postCoverImagePaths])];
	for (const imgPath of allImagePaths) {
<<<<<<< HEAD
		if (imgPath && imgPath !== '\\N') {
=======
    if (imgPath && imgPath !== "\\N") {
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			await createMediaItemEntry(imgPath, defaultUploaderId);
		}
	}
	console.log(`Created/Upserted ${mediaItemCache.size} initial MediaItems.`);

<<<<<<< HEAD
	const mpcHauptsitz = await prisma.mapPointCategory.create({
		data: { nameRawTranslationId: await createRawTranslationWithData({ de: "Hauptsitz", en: "Headquarters", it: "Sede centrale" }) }
	});
	const mpcKrankenhaeuser = await prisma.mapPointCategory.create({
		data: { nameRawTranslationId: await createRawTranslationWithData({ de: "Krankenhäuser", en: "Hospitals", it: "Ospedali" }) }
	});
	const mpcUnterstuetzung = await prisma.mapPointCategory.create({
		data: { nameRawTranslationId: await createRawTranslationWithData({ de: "Unterstützungsgruppen", en: "Support Groups", it: "Gruppi di supporto" }) }
	});
	const mpcForschung = await prisma.mapPointCategory.create({
		data: { nameRawTranslationId: await createRawTranslationWithData({ de: "Forschungszentren", en: "Research Centers", it: "Centri di ricerca" }) }
	});
	console.log('Created MapPointCategories');

	await prisma.mapPoint.create({
		data: {
			nameRawTranslationId: await createRawTranslationWithData({ de: "ALS Research Institute", en: "ALS Research Institute", it: "Istituto di Ricerca SLA" }),
			descriptionRawTranslationId: await createRawTranslationWithData({ de: "Führend in ALS-Studien", en: "Leader in ALS studies", it: "Leader negli studi sulla SLA" }),
=======
  // --- 2. MapPointCategories (from old MapPointType) ---
  const mpcHauptsitz = await prisma.mapPointCategory.create({
    data: {
      nameRawTranslationId: await createRawTranslationWithData({
        de: "Hauptsitz",
        en: "Headquarters",
        it: "Sede centrale",
      }),
    },
  });
  const mpcKrankenhaeuser = await prisma.mapPointCategory.create({
    data: {
      nameRawTranslationId: await createRawTranslationWithData({
        de: "Krankenhäuser",
        en: "Hospitals",
        it: "Ospedali",
      }),
    },
  });
  const mpcUnterstuetzung = await prisma.mapPointCategory.create({
    data: {
      nameRawTranslationId: await createRawTranslationWithData({
        de: "Unterstützungsgruppen",
        en: "Support Groups",
        it: "Gruppi di supporto",
      }),
    },
  });
  const mpcForschung = await prisma.mapPointCategory.create({
    data: {
      nameRawTranslationId: await createRawTranslationWithData({
        de: "Forschungszentren",
        en: "Research Centers",
        it: "Centri di ricerca",
      }),
    },
  });
  console.log("Created MapPointCategories");

  // --- 3. MapPoints ---
  await prisma.mapPoint.create({
    data: {
      nameRawTranslationId: await createRawTranslationWithData({
        de: "ALS Research Institute",
        en: "ALS Research Institute",
        it: "Istituto di Ricerca SLA",
      }),
      descriptionRawTranslationId: await createRawTranslationWithData({
        de: "Führend in ALS-Studien",
        en: "Leader in ALS studies",
        it: "Leader negli studi sulla SLA",
      }),
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			categoryId: mpcForschung.id,
			latitude: 52.52,
			longitude: 13.405,
			createdAt: new Date("2025-03-12 11:19:01.389"),
			updatedAt: new Date("2025-03-12 11:19:01.389"),
<<<<<<< HEAD
		}
=======
    },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
	});
	await prisma.mapPoint.create({
		data: {
			nameRawTranslationId: await createRawTranslationWithData({ de: "Olang", en: "Olang", it: "Valdaora" }),
<<<<<<< HEAD
			descriptionRawTranslationId: await createRawTranslationWithData({ de: "Hauptsitz der Organisation", en: "Headquarters of the organization", it: "Sede dell'organizzazione" }),
=======
      descriptionRawTranslationId: await createRawTranslationWithData({
        de: "Hauptsitz der Organisation",
        en: "Headquarters of the organization",
        it: "Sede dell'organizzazione",
      }),
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			categoryId: mpcHauptsitz.id,
			latitude: 46.7419,
			longitude: 12.0196,
			createdAt: new Date("2025-03-12 11:28:01.802"),
			updatedAt: new Date("2025-03-12 11:28:01.802"),
<<<<<<< HEAD
		}
	});
	console.log('Created MapPoints');

=======
    },
  });
  console.log("Created MapPoints");

  // --- 4. Links ---
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
	const linksData = [
		{ name: "Deutschland - Charité", url: "https://als-charite.de/" },
		{ name: "Deutschland - ALS Mobil", url: "https://www.als-mobil.de/" },
		{ name: "Deutschland - DGM", url: "https://www.dgm.org/muskelerkrankungen/amyotrophe-lateralsklerose-als" },
		{ name: "Deutschland - ALS Leben", url: "https://www.als-leben.de/" },
		{ name: "Deutschland - DZNE", url: "https://www.dzne.de/aktuelles/hintergrund/amyotrophe-lateralsklerose-als/" },
		{ name: "Deutschland - DocCheck", url: "https://flexikon.doccheck.com/de/Amyotrophe_Lateralsklerose" },
		{ name: "Österreich - Verein Forum ALS", url: "https://www.als-info.at/web/index.php/verein-forum-als" },
<<<<<<< HEAD
		{ name: "Österreich - Gesundheit.gv", url: "https://www.gesundheit.gv.at/krankheiten/gehirn-nerven/amyotrophe-lateralsklerose.html" },
		{ name: "Schweiz - ALS Schweiz", url: "https://www.als-schweiz.ch/" },
		{ name: "Schweiz - Muskelgesellschaft", url: "https://muskelgesellschaft.ch/diagnosen/amyotrophe-lateralsklerose-als/" },
		{ name: "Italien - ConSlancio", url: "https://www.conslancio.it/" },
		{ name: "Italien - AISLA", url: "https://www.aisla.it/" },
		{ name: "Italien - Arisla", url: "https://www.arisla.org/" },
		{ name: "Italien - Nemo", url: "https://www.centrocliniconemo.it/cura-e-ricerca/patologie/sclerosi-laterale-amiotrofica/" },
=======
    {
      name: "Österreich - Gesundheit.gv",
      url: "https://www.gesundheit.gv.at/krankheiten/gehirn-nerven/amyotrophe-lateralsklerose.html",
    },
    { name: "Schweiz - ALS Schweiz", url: "https://www.als-schweiz.ch/" },
    {
      name: "Schweiz - Muskelgesellschaft",
      url: "https://muskelgesellschaft.ch/diagnosen/amyotrophe-lateralsklerose-als/",
    },
    { name: "Italien - ConSlancio", url: "https://www.conslancio.it/" },
    { name: "Italien - AISLA", url: "https://www.aisla.it/" },
    { name: "Italien - Arisla", url: "https://www.arisla.org/" },
    {
      name: "Italien - Nemo",
      url: "https://www.centrocliniconemo.it/cura-e-ricerca/patologie/sclerosi-laterale-amiotrofica/",
    },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		{ name: "Arm-Unterstützung - Armon", url: "https://armonproducts.com/de/homepage-de_de/" },
		{ name: "Arm-Unterstützung - Kinova Robotics", url: "https://assistive.kinovarobotics.com/de/" },
		{ name: "Distributor - Hidrex", url: "https://www.hidrex.de/" },
		{ name: "Distributor - Talktools", url: "https://www.talktools-gmbh.de/" },
		{ name: "Distributor - Re-Mobility", url: "https://www.re-mobility.at/" },
		{ name: "Distributor - BTL Italia", url: "https://www.btlitalia.com/clinic-locator-patient" },
	];
	for (const link of linksData) {
		const nameTranslations = {
			de: link.name,
			en: link.name,
<<<<<<< HEAD
			it: link.name
=======
      it: link.name,
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		};
		await prisma.link.create({
			data: {
				nameRawTranslationId: await createRawTranslationWithData(nameTranslations),
				url: link.url,
<<<<<<< HEAD
			}
		});
	}
	console.log('Created Links');

	const navbarItems = [
		{ texts: { de: "Startseite", en: "Home", it: "Home" }, href: "#hero", withLangPrefix: true },
=======
      },
    });
  }
  console.log("Created Links");

  // --- 5. Navbar ---
  const navbarItems = [
    { texts: { de: "Startseite", en: "Home", it: "Home" }, href: "#hero", withLangPrefix: true },
    { texts: { de: "Veranstaltungen", en: "Events", it: "Eventi" }, href: "#events", withLangPrefix: true },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		{ texts: { de: "Karte", en: "Map", it: "Mappa" }, href: "#map", withLangPrefix: true },
		{ texts: { de: "Über uns", en: "About us", it: "Chi siamo" }, href: "#about", withLangPrefix: true },
		{ texts: { de: "Medien", en: "Media", it: "Media" }, href: "media", withLangPrefix: true },
		{ texts: { de: "Link", en: "Link", it: "Link" }, href: "links", withLangPrefix: true },
<<<<<<< HEAD
		{ texts: { de: "Forschung & Austausch", en: "Research & Exchange", it: "Ricerca e Scambio" }, href: "#blogs", withLangPrefix: true },
=======
    {
      texts: { de: "Forschung & Austausch", en: "Research & Exchange", it: "Ricerca e Scambio" },
      href: "#blogs",
      withLangPrefix: true,
    },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		{ texts: { de: "Promis", en: "Celebs", it: "Celebrità" }, href: "#promis", withLangPrefix: true },
	];
	for (const item of navbarItems) {
		await prisma.navbar.create({
			data: {
				textRawTranslationId: await createRawTranslationWithData(item.texts),
				href: item.href,
				withLanguagePrefix: item.withLangPrefix,
<<<<<<< HEAD
			}
		});
	}
	console.log('Created Navbar items');

	const celebritiesData = [
		{ name: "Lou Gehrig", profession: "Baseballspieler", born: "1903-06-19", died: "1941-06-02", alsYear: 1939, bio: "Legendärer Baseballspieler der New York Yankees. ALS ist auch als \"Lou-Gehrig-Syndrom\" bekannt.", imagePath: "/avatar.png" },
		{ name: "Stephen Hawking", profession: "Physiker", born: "1942-01-08", died: "2018-03-14", alsYear: 1963, bio: "Berühmter theoretischer Physiker, bekannt für seine Arbeiten zu Schwarzen Löchern und Kosmologie. Trotz ALS-Diagnose mit 21 wurde er 76 Jahre alt.", imagePath: "/avatar.png" },
		{ name: "Stephen Hillenburg", profession: "Animator, Creator of SpongeBob", born: "1961-08-21", died: "2018-11-26", alsYear: 2017, bio: "Stephen Hillenburg was the creator of SpongeBob SquarePants and died of ALS in 2018.", imagePath: null },
		{ name: "Bryan Randall", profession: "Photographer", born: "1966-04-10", died: "2023-08-05", alsYear: 2020, bio: "Bryan Randall, longtime partner of Sandra Bullock, died of ALS in 2023.", imagePath: null },
		{ name: "Jon Stone", profession: "Television Director and Producer", born: "1931-04-13", died: "1997-03-30", alsYear: 1995, bio: "Jon Stone was a co-creator of Sesame Street who passed away from ALS.", imagePath: null },
		{ name: "Sam Shepard", profession: "Actor and Playwright", born: "1943-11-05", died: "2017-07-27", alsYear: 2015, bio: "Sam Shepard was a Pulitzer Prize-winning playwright and actor who died from ALS.", imagePath: null },
		{ name: "Kenneth Mitchell", profession: "Actor", born: "1974-11-24", died: null, alsYear: 2020, bio: "Canadian actor known for Star Trek: Discovery, publicly disclosed his ALS diagnosis in 2020.", imagePath: null },
		{ name: "Jörg Immendorff", profession: "Painter", born: "1945-06-14", died: "2007-05-28", alsYear: 1998, bio: "German painter and sculptor diagnosed with ALS in the late 1990s.", imagePath: null },
		{ name: "Polly Platt", profession: "Producer and Production Designer", born: "1939-01-29", died: "2011-07-27", alsYear: 2010, bio: "Polly Platt was a Hollywood producer and designer possibly affected by ALS.", imagePath: null },
		{ name: "Nina Zacher", profession: "ALS Patient Advocate", born: "1973-09-12", died: "2017-03-27", alsYear: 2015, bio: "Nina Zacher gained public attention in Germany for raising ALS awareness before her death in 2017.", imagePath: null },
=======
      },
    });
  }
  console.log("Created Navbar items");

  // --- 6. Celebrities ---
  const celebritiesData = [
    {
      name: "Lou Gehrig",
      profession: "Baseballspieler",
      born: "1903-06-19",
      died: "1941-06-02",
      alsYear: 1939,
      bio: 'Legendärer Baseballspieler der New York Yankees. ALS ist auch als "Lou-Gehrig-Syndrom" bekannt.',
      imagePath: "/avatar.png",
    },
    {
      name: "Stephen Hawking",
      profession: "Physiker",
      born: "1942-01-08",
      died: "2018-03-14",
      alsYear: 1963,
      bio: "Berühmter theoretischer Physiker, bekannt für seine Arbeiten zu Schwarzen Löchern und Kosmologie. Trotz ALS-Diagnose mit 21 wurde er 76 Jahre alt.",
      imagePath: "/avatar.png",
    },
    {
      name: "Stephen Hillenburg",
      profession: "Animator, Creator of SpongeBob",
      born: "1961-08-21",
      died: "2018-11-26",
      alsYear: 2017,
      bio: "Stephen Hillenburg was the creator of SpongeBob SquarePants and died of ALS in 2018.",
      imagePath: null,
    },
    {
      name: "Bryan Randall",
      profession: "Photographer",
      born: "1966-04-10",
      died: "2023-08-05",
      alsYear: 2020,
      bio: "Bryan Randall, longtime partner of Sandra Bullock, died of ALS in 2023.",
      imagePath: null,
    },
    {
      name: "Jon Stone",
      profession: "Television Director and Producer",
      born: "1931-04-13",
      died: "1997-03-30",
      alsYear: 1995,
      bio: "Jon Stone was a co-creator of Sesame Street who passed away from ALS.",
      imagePath: null,
    },
    {
      name: "Sam Shepard",
      profession: "Actor and Playwright",
      born: "1943-11-05",
      died: "2017-07-27",
      alsYear: 2015,
      bio: "Sam Shepard was a Pulitzer Prize-winning playwright and actor who died from ALS.",
      imagePath: null,
    },
    {
      name: "Kenneth Mitchell",
      profession: "Actor",
      born: "1974-11-24",
      died: null,
      alsYear: 2020,
      bio: "Canadian actor known for Star Trek: Discovery, publicly disclosed his ALS diagnosis in 2020.",
      imagePath: null,
    },
    {
      name: "Jörg Immendorff",
      profession: "Painter",
      born: "1945-06-14",
      died: "2007-05-28",
      alsYear: 1998,
      bio: "German painter and sculptor diagnosed with ALS in the late 1990s.",
      imagePath: null,
    },
    {
      name: "Polly Platt",
      profession: "Producer and Production Designer",
      born: "1939-01-29",
      died: "2011-07-27",
      alsYear: 2010,
      bio: "Polly Platt was a Hollywood producer and designer possibly affected by ALS.",
      imagePath: null,
    },
    {
      name: "Nina Zacher",
      profession: "ALS Patient Advocate",
      born: "1973-09-12",
      died: "2017-03-27",
      alsYear: 2015,
      bio: "Nina Zacher gained public attention in Germany for raising ALS awareness before her death in 2017.",
      imagePath: null,
    },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
	];

	for (const celeb of celebritiesData) {
		const bioTranslations: { [lang: string]: string } = {
			de: celeb.bio,
			en: celeb.bio,
			it: celeb.bio,
		};
		const professionTranslations: { [lang: string]: string } = {
			de: celeb.profession,
			en: celeb.profession,
			it: celeb.profession,
		};

		await prisma.celebrity.create({
			data: {
				name: celeb.name,
				bioRawTranslationId: await createRawTranslationWithData(bioTranslations),
				professionRawTranslationId: await createRawTranslationWithData(professionTranslations),
				born: new Date(celeb.born),
				died: celeb.died ? new Date(celeb.died) : null,
				alsYear: celeb.alsYear,
<<<<<<< HEAD
				imageId: await createMediaItemEntry(celeb.imagePath, defaultUploaderId),
			}
		});
	}
	console.log('Created Celebrities');

	const booksData = [
		// Group 1: Spencer-Wendel (ID 46 DE, ID 48 IT)
=======
        imageId: await createMediaItemEntry(celeb.imagePath, defaultUploaderId), // Uses storageKey
      },
    });
  }
  console.log("Created Celebrities");

  // --- 7. Books ---
  const booksData = [
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		{
			titles: { de: "Bevor ich gehe", it: "Prima di dirti addio. L'anno in cui ho imparato a vivere" },
			author: "Susan Spencer-Wendel, Bret Witter",
			published: "2013-01-01",
			contents: {
				de: "<p>Susan Spencer-Wendel ist erfolgreiche Journalistin und Mutter dreier Kinder, als sie erfährt, dass sie an ALS erkrankt ist und nur noch kurze Zeit zu leben hat. Fest entschlossen, jeden Tag zu genießen und ihrer Familie schöne, gemeinsame Erinnerungen zu hinterlassen, unternimmt sie mit ihren Kindern Dinge, für die sie später weder Zeit noch Kraft haben wird: ein Brautkleid für ihre Tochter aussuchen oder mit Delfinen schwimmen. Ein weises, bewegendes Buch, das uns lehrt, das Leben auszukosten, so kurz es auch sein mag. Tieftraurig, inspirierend und sehr ermutigend!</p>",
<<<<<<< HEAD
				it: "<p>Sollevai la mano. Era scarna e pallida. Nel palmo erano visibili le linee dei tendini... Susan Spencer-Wendel, madre di tre figli, scopre di avere la SLA. Decide di trascorrere il tempo che le rimane viaggiando con le persone che ama: nello Yukon per le aurore boreali, in Ungheria, a Cipro e New York con la figlia per provare il vestito da sposa. Un anno alla scoperta degli affetti più veri.</p>"
			},
			coverImagePaths: ["23.1 Bevor ich gehe - Für meine Kinder.jpg", "23.2 Bevor ich gehe - Für meine Kinder.png", "24.1 Bevor ich gehe - Erinnerungen.jpg"],
			oldIds: [46, 48]
		},
		// Group 2: Pia Pera (ID 31 DE, ID 47 IT)
=======
        it: "<p>Sollevai la mano. Era scarna e pallida. Nel palmo erano visibili le linee dei tendini... Susan Spencer-Wendel, madre di tre figli, scopre di avere la SLA. Decide di trascorrere il tempo che le rimane viaggiando con le persone che ama: nello Yukon per le aurore boreali, in Ungheria, a Cipro e New York con la figlia per provare il vestito da sposa. Un anno alla scoperta degli affetti più veri.</p>",
      },
      coverImagePaths: [
        "23.1 Bevor ich gehe - Für meine Kinder.jpg",
        "23.2 Bevor ich gehe - Für meine Kinder.png",
        "24.1 Bevor ich gehe - Erinnerungen.jpg",
      ],
      oldIds: [46, 48],
    },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		{
			titles: { de: "Die Weisheit meines Gartens", it: "Al giardino ancora non l'ho detto" },
			author: "Pia Pera",
			published: "2020-01-01",
			contents: {
				de: "<p>An einem Junitag vor ein paar Jahren bemerkte der Mann, der behauptete, mich zu lieben, dass ich hinkte. Mit Mitte fünfzig erkrankt die italienische Journalistin Pia Pera an Amyotropher Lateralsklerose (ALS), einer unheilbaren Erkrankung des motorischen Nervensystems. Was macht ein Mensch, der das Ende so drastisch vor Augen hat? Pia Pera geht in ihren geliebten Garten, der für sie seit jeher ein besonderer Ort war. Dort, in der toskanischen Idylle, inmitten von Blumen, Obst- und Olivenhainen, beginnt ein ebenso berührendes wie kluges Zwiegespräch - mit der Natur und mit sich selbst. Dort sucht sie Trost, Kraft und eine Antwort auf die Frage, worauf es am Ende ankommt im Leben.</p>",
<<<<<<< HEAD
				it: "<p>Per molti versi, avrei preferito non dover pubblicare questo libro, che non esisterebbe se una delle mie scrittrici preferite - non posso nemmeno incominciare a spiegare l'importanza che ha avuto nella mia vita, professionale ma soprattutto personale, il suo \"Orto di un perdigiorno\" - non si trovasse in condizioni di salute che non lasciano campo alla speranza. [...] Un dono meraviglioso quello che Pia Pera ha fatto a se stessa e che poi ha deciso di condividere con i suoi lettori.</p>"
			},
			coverImagePaths: ["8.2 Die Weisheit meines Gartens Wie die Natur mich lehrte worauf es am Ende ankommt im Leben.png"],
			oldIds: [31, 47]
		},
		// Other books (assuming primarily German, one language entry for title/content)
		{ titles: { de: "ALS und andere Ansichtssachen" }, author: "Christian Bär", published: "2019-01-01", contents: { de: "<p>Amyotrophe Lateralsklerose, kurz ALS, ist eine unheilbare Erkrankung des motorischen Nervensystems. Dabei bauen sich die Nerven und infolgedessen die Muskeln ab, und deshalb verlieren die Betroffenen sukzessive die Kontrolle über sämtliche Körperfunktionen. Christian Bär ist betroffen – er erhielt die Diagnose 2016 im Alter von 38 Jahren, mitten im Leben, gerade Vater geworden. Er ist ein sportlicher, umtriebiger, vielseitig interessierter, aktiver und sympathischer Mensch, den die Krankheit mit voller Wucht aus seinem bisher „normalen“ Familien-, Privat- und Arbeitsleben katapultiert. Seinen Krankheitsverlauf schildert Bär nüchtern und manchmal fast sarkastisch, vom ersten Zucken seines rechten Bizeps über den Verlust nahezu aller Fähigkeiten bis auf die ihm nunmehr noch verbleibende Kontrolle über seine Augen. Begonnen als Blog, für den er 2019 verdientermaßen den Grimme Online Award erhielt, ist dieses Buch ein beeindruckendes Zeugnis eines Menschen, der trotz seiner Krankheit Lebensmut und Humor bewahrt.</p>" }, coverImagePaths: ["24.2 Bevor ich gehe - Erinnerungen.png"], oldIds: [24] },
		{ titles: { de: "Leben und gleichzeitig sterben" }, author: "Sarah Braun", published: "2020-01-01", contents: { de: "<p>Sarah Braun erhält im Alter von 24 Jahren die Diagnose ALS, amyotrophe Lateralsklerose. Es ist ein Todesurteil, denn ihre Lebenserwartung beträgt noch drei bis fünf Jahre. Früher zu sterben als die meisten anderen im eigenen Umfeld ist herausfordernd, weil eine andere Lebenswelt betreten wird. Dabei zuzusehen, wie ein nahestehender Mensch stirbt, ist eine Grenzerfahrung. Dieses Buch liefert Einblicke in den Sterbeprozess aus Sicht einer Betroffenen sowie ihrer engsten Wegbegleiter*innen. Es will Hoffnung darauf machen, dass es sich lohnt, dieses Leben zu leben. \"Ich für meinen Teil möchte nach meinem Tod eine Hummel werden. Hummeln sehen lustig aus, sind flauschig, tun Gutes aus purem Egoismus und weil ihnen niemand gesagt hat, dass sie eigentlich nicht fliegen können, tun sie es trotzdem. Und vom Baum aus zusehen kann ich dann auch.\" Sarah Braun</p>" }, coverImagePaths: ["22.1 Leben und gleichzeitig sterben.jpg", "22.2 Leben und gleichzeitig sterben.png"], oldIds: [25] },
		{ titles: { de: "Das Jahr ohne Worte" }, author: "Alexandra", published: "2020-11-29", contents: { de: "<p>Fünf Jahreszeiten einer Liebe. Eine überwältigende Geschichte. Eine unglaubliche Geschichte. Und doch eine wahre Geschichte. Alles beginnt mit einer großen Liebe. \"Sowohl als auch\" heißt das Café in Prenzlauer Berg, in dem Syd Theo kennenlernt. Theo ist Filmemacher, alleinstehend, charismatisch. Syd weiß sofort, dass es die Art von Liebe ist, die sie vermutlich nur einmal erleben wird. Die beiden bekommen ein Kind, ziehen zusammen, erleben großes Glück und überstehen kleine Krisen. Doch dann erhält Theo eine niederschmetternde Diagnose: ALS. Die Krankheit, an der auch Stephen Hawking litt. Von dem Mann, in den Syd sich einst verliebt hat, ist Tag für Tag weniger übrig. Und doch kämpft sie um ihn. Sie will das, was von ihrem Glück noch übrig ist, unbedingt bewahren. Bis sie eines Tages eine ungeheuerliche Entdeckung macht.</p>" }, coverImagePaths: ["3.1 Das Jahr ohne Worte.png", "3.2 Das Jahr ohne Worte.png"], oldIds: [26] },
		{ titles: { de: "Ich will noch leben bevor ich sterbe" }, author: "Unbekannt", published: "2012-01-01", contents: { de: "<p>Nach der niederschmetternden Diagnose ALS im Jahr 2012 hätte ich aufgeben können, aber ich entwickelte einen unbändigen Überlebenswillen. Ich wollte Antworten und begab mich auf meine Reise und fand sie in der Liebe, der Hoffnung, der Epigenetik und meiner mentalen Gesundheit durch Hypnose. Heute bin ich glücklich und dankbar für die vergangenen Jahre, in denen ich meine Antworten fand. Als ich den Sattel meiner Pferde gegen einen Rollstuhl tauschen musste, hätte ich niemals gedacht, wieder richtig glücklich zu werden. Du denkst, du kannst dein Schicksal nicht ändern? Wir können entscheiden, wie wir unser Leben betrachten, jeden Tag aufs Neue. Dieses Buch ist für jeden, der die Kraft in sich selbst entdecken möchte, der jenseits der Hoffnungslosigkeit neue Wege finden möchte. Es ist ein Buch über die Macht, die uns innewohnt – wir müssen sie nur finden.</p>" }, coverImagePaths: ["4.1 Ich will noch leben bevor ich sterbe.png", "4.2 Ich will noch leben bevor ich sterbe.png"], oldIds: [27] },
		{ titles: { de: "Such dir einen schönen Stern am Himmel" }, author: "Nina Zacher", published: "2020-01-01", contents: { de: "<p>Das Schicksal trifft Nina Zacher aus heiterem Himmel. Mit Anfang 40 wird bei der vierfachen Mutter ALS diagnostiziert, eine Erkrankung, bei der der Körper langsam zerfällt, der Geist aber hellwach bleibt. Doch statt sich zurückzuziehen und auf den Tod zu warten, geht Nina Zacher an die Öffentlichkeit. Zehntausende folgen der jungen Frau und Mutter von vier kleinen Kindern auf Facebook. Ehrlich und direkt schreibt sie über ihr Leben, ihr Leiden und ihr Sterben und beweist dabei ungeheure Stärke und Lebensmut. Bis kurz vor ihrem Tod teilt sie ihre Gedanken, und als sie sich fast nicht mehr bewegen kann, schreibt sie ihre Texte mit einem augengesteuerten Spezial-Computer. Ihren größten Traum, ein Buch zu schreiben, kann sie nicht mehr verwirklichen. Doch ihr Mann erfüllt ihr diesen letzten Wunsch und löst damit sein Versprechen ein, den entschlossenen Kampf seiner Frau gegen die heimtückische Krankheit weiterzuführen. So ist ein tiefberührendes Vermächtnis entstanden, das über den Tod hinausgeht. Für Karl-Heinz Zacher ist es ein Zeugnis ihrer unerschütterlichen Liebe, das ihm nun ermöglicht, die Familie in ein Leben ohne seine Frau zu führen. Und es ist eine tiefgründige Antwort auf die Frage, was am Ende wirklich zählt.</p>" }, coverImagePaths: ["5.1 Such dir einen schönen Stern am Himmel.jpg", "5.2 Such dir einen schönen Stern am Himmel.png"], oldIds: [28] },
		{ titles: { de: "Wer stirbt denn nicht?" }, author: "Philipp Hanf", published: "2020-01-01", contents: { de: "<p>Philipp Hanf erlebte diesen Moment vor fünf Jahren, mit 47: Er erhielt die Diagnose, an Amyotropher Lateralsklerose erkrankt zu sein. Ein Schock. Für ihn, für seine Frau, für seine Familie. Die Diagnose setzte vieles auf einmal in Bewegung. Philipp Hanf hörte auf zu arbeiten, und sein Leben verlief plötzlich wie im Zeitraffer. Da ihm die Schulmedizin wenig zu bieten hatte, betrat er unvoreingenommen neue Pfade: Er traf Geistheiler und Schamanen, ging den Fähigkeiten von Shaolin-Mönchen auf den Grund, stand seinem inneren Kind gegenüber oder praktizierte uralte vergessene Yoga-Techniken. Er lernte, ungeahnte Kräfte freizusetzen, auf sein Herz zu hören und mit Konventionen zu brechen. Er suchte nach Alternativen, der Krankheit zu begegnen – und fand darüber zu sich selbst. Dieses Buch ist weder eine schwermütige Krankheitsgeschichte noch ein dogmatisches spirituelles Regelwerk. Substanz gewinnt es, weil Philipp Hanf persönliche Biografie und Prägungen mit vielfältigen Therapie- und Denkansätzen in Beziehung setzt. Als versierter Schulmediziner wendet er sich alternativen medizinischen Konzepten zu – ohne Gefahr zu laufen, blind diffusen Heilslehren zu verfallen. Im Gegenteil: Er entdeckt viele Schnittstellen zur traditionellen westlichen Medizin. Philipp Hanf ist durchaus dankbar für das, was ihm widerfahren ist, auch wenn ihm nicht mehr viel Zeit bleibt. Heute weiß er: Heilung und Tod schließen einander nicht aus. »Wer stirbt denn nicht« erklärt die Genese dieses für manch einen sicherlich überraschenden Fazit. Philipp Hanf lädt seine Leser und Leserinnen ein, den Weg dieser Erkenntnis mit ihm gemeinsam zu beschreiten. Anstatt eines Abgesangs erwartet sie ein leidenschaftliches Plädoyer fürs Leben – offen, einleuchtend und keineswegs humorlos.</p>" }, coverImagePaths: ["6a Wer stirbt denn nicht.jpg", "6b.1 Wer stirbt denn nicht.jpg", "6b.2 Wer stirbt denn nicht.jpg"], oldIds: [29] },
		{ titles: { de: "Zu den Ursprüngen oder Emil und die Weberknechte" }, author: "Emil Weber", published: "2020-01-01", contents: { de: "<p>Der Mensch fährt und Gott hält den Lenker. Durch die Pilgramgasse in Wien ist Emil Weber damals geradelt, auf seinem Canyon-Bike, es war kalt. Er merkte, dass er die Finger seiner rechten Hand nach dem Bremsen nicht mehr zurückbiegen konnte und musste sie mit der linken Hand wieder aufbiegen. Im November 2016 war das. Drei Monate später bekam er die Diagnose ALS – Amyotrophe Lateralsklerose. Eine seltene, aber unheilbare Nervenkrankheit, die durch die weltweite Spendenaktion ICE-Bucket-Challenge bekannt wurde. Bei der Diagnose betrug Emil Webers statistische Lebenserwartung zwei bis vier Jahre. Früher machte Herr Weber viel Sport. Noch 2017 radelte er, schon in Kenntnis seiner Krankheit, fünf Wochen lang entlang der wichtigsten Flüsse Österreichs zu deren Ursprüngen. 2700 km, 22.000 Höhenmeter. 16 Freunde organisierten sich so, dass er nie allein radelte. Später schrieb Emil Weber das nun vorliegende Buch. Für seine 16 Weberknechte. Der erste Satz im Prolog lautet: „Ich bin froh, dass ich diese Zeilen noch schreiben kann.“ Heute schreibt Emil Weber mit einem augengesteuerten Computer. Der Reinerlös dieses Buches kommt ausschließlich dem Forum ALS – Verein für multiprofessionelle ALS-Hilfe mit Sitz in Wien zugute.</p>" }, coverImagePaths: ["7.1 Zu den Ursprüngen oder Emil und die Weberknechte.jpg", "7.2 Zu den Ursprüngen oder Emil und die Weberknechte.png"], oldIds: [30] },
		{ titles: { de: "Der Sinn des Lesens" }, author: "Pieter Steinz", published: "2016-01-01", contents: { de: "<p>Im Sommer 2013 wurde bei dem niederländischen Journalisten und Buchliebhaber Pieter Steinz die unheilbare Nervenkrankheit ALS diagnostiziert. Nur wenige Monate später begann er eine Reihe von 52 kurzen Essays über seine Krankheit und vor allem über seine Lieblingsbücher und -autoren zu schreiben, über Dickens, Alexandre Dumas und Shakespeare, über Stevenson, Thomas Mann und Proust, Ovid und Seneca – aber auch über Carl Barks, Jacques Brel und Astrid Lindgren. Pieter Steinz starb am 29. August 2016 in Haarlem. In diesen ebenso anrührenden wie lebensfrohen und humorvollen Betrachtungen setzte Pieter Steinz seinen körperlichen Verfall in Beziehung zur Weltliteratur. So wendet er sich Oscar Wildes »Bildnis des Dorian Gray« zu, wenn er über die Veränderungen seines Körpers nachdenkt, dem »Hungerkünstler« Kafkas, wenn er über die zunehmend auftretenden Schwierigkeiten bei der Nahrungsaufnahme berichtet; Andersens »kleiner Meerjungfrau«, die sich zwischen Tanzen und Sprechen entscheiden muss, dient ihm als Folie der Geschichte seines Stimmverlusts. Trotz des düsteren Grundthemas sind diese kunstvoll gebauten Essays voll uneitler, ja tapferer Ausstrahlung, was in Holland bei Erscheinen zahlreiche Reaktionen auslöste.</p>" }, coverImagePaths: ["9.1 Sinn des Lesens.jpg", "9.2 Sinn des Lesens.png"], oldIds: [32] },
		{ titles: { de: "Ich bin eine Insel: Gefangen im eigenen Körper" }, author: "Sandra Schadek", published: "2020-01-01", contents: { de: "<p>Die Diagnose Amyotrophe Lateralsklerose (ALS) war ein enormer Schock für mich; ich konnte mir nicht vorstellen, dass ich wirklich an einer so schweren, unheilbaren und tödlichen Krankheit leiden sollte – aber ich wurde vom Gegenteil überzeugt. Also habe ich beschlossen, der ALS nicht kampflos das Feld zu überlassen. Ich habe gelernt, mich mit der Krankheit zu arrangieren. Es liegt an mir, wie die letzten Jahre meines Lebens verlaufen. Denn eines steht fest: Das Leben geht weiter, so oder so! Sandra Schadeks Körper gehorcht ihr nicht mehr: Die tödliche Krankheit ALS, die durch Stephen Hawking ins Bewusstsein der Öffentlichkeit drang, hat ihre Nerven und Muskeln gelähmt, sprechen kann sie kaum noch. Geblieben sind der jungen Frau trotz allem ein unglaublicher Optimismus und die Fähigkeit, Kraft aus ihrer Situation zu schöpfen – und ihr sogar humorvolle Seiten abzugewinnen.</p>" }, coverImagePaths: ["10.1 Ich bin eine Insel Gefangen im eigenen Körper.jpg", "10.2 Ich bin eine Insel Gefangen im eigenen Körper.jpg"], oldIds: [33] },
		{ titles: { de: "Rudern ohne Ruder - Mein Leben und Sterben mit ALS" }, author: "Ulla-Carin Lindquist", published: "2020-01-01", contents: { de: "<p>An ihrem 50. Geburtstag erfuhr die schwedische Nachrichtenmoderatorin Ulla-Carin Lindquist, dass sie an der tödlichen Krankheit ALS erkrankt sei. Unsentimental und dafür umso eindrucksvoller berichtet Lindquist von ihrem körperlichen Verfall, den Gesprächen mit ihren Kindern, ihrer Verwundbarkeit, der zunehmenden Hilflosigkeit, von Trauer, Verzweiflung und Akzeptanz. Ein Buch voll dramatischer Intensität und bittersüßer Liebe zum Leben angesichts des nahenden Todes. „DIESES BUCH IST MEIN DEBUT UND MEIN FINALE\" Die populäre schwedische Nachrichtenmoderatorin Lindquist berichtet über ein Jahr mit ALS, ihr letztes Lebensjahr. Ein Buch voll dramatischer Intensität und bittersüßer Liebe zum Leben angesichts des nahenden Todes. ,Anspruchsvoll, mit großer Stilsicherheit und bar jeder Sentimentalität. absolut fesselnd und zugleich bestürzend.\"Svenska Dagbladet\"- Rudern ohne Ruder - ist weit mehr als nur eine Art ALS-Schicksal. Es ist eine großartige Darstellung dessen, was es heißt, ein Mensch zu sein. Zu existieren und anzuerkennen, dass wir nicht ewig leben.\"Norrkopings Tidningar.</p>" }, coverImagePaths: ["11.1 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.png", "11.2 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.jpg", "11.3 Rudern ohne Ruder - Wein Leben und Sterben mit ALS.png"], oldIds: [34] },
		{ titles: { de: "Am Leben Sein: Ein Leben mit Amyotropher Lateralsklerose" }, author: "Ines Schmidt", published: "2020-01-01", contents: { de: "<p>Die Diagnose ALS erhielt Paul im Alter von 17 Jahren. In den Jahren des Leidens nutzte er seine besonderen musikalischen Begabungen, seine künstlerischen Ambitionen und seine mentale Stärke und hinterließ damit wunderbare Spuren. Seine außergewöhnliche Geschichte, begleitet von seiner Musik auf einer Audio-CD und den „Ansichten eines Sterbenden“ in den zahlreichen Fotos, eröffnet einen besonderen Blick auf das Leben, unser Leben und das Sterben. Dennoch bleibt die Geschichte nicht bei Pauls Leidensweg stehen, sie steht gleichsam vertretend für alle sterbenskranken Menschen, die trotz ihres außerordentlich großen Leides immer wieder Kraft schöpfen und ihre Energien freisetzen, und die liebevoll begleitet werden von ihren Nächsten. Themen wie Leid, Mitgefühl, Würde, Leben, Sterben und Spiritualität rücken dabei unweigerlich in den Fokus der Betrachtung. Am Ende steht eine alles entscheidende Konsequenz, die wir Erdenbürger unser gesamtes Leben lang nie vergessen sollten: DIE LIEBE IST DER SINN UNSERES LEBENS!</p>" }, coverImagePaths: ["12.1 Am Leben sein.jpg", "12.2 Am Leben sein.jpg"], oldIds: [35] },
		{ titles: { de: "In der Überlebensfalle: Erfahrungen einer ALS-Patientin" }, author: "Sonja Balmer", published: "2020-01-01", contents: { de: "<p>Seit 2001 weiß Sonja Balmer, dass die Lähmungserscheinungen und Atembeschwerden, an denen sie schon länger leidet, einen Namen haben: Die heute 36-Jährige leidet an Amyotropher Lateralsklerose (ALS). Diese unheilbare neurologische Erkrankung führt in einem langsam fortschreitenden Prozess zu irreversibler Muskellähmung einschließlich der Atemmuskulatur und endet tödlich. ALS ist selten: Jährlich erkranken ein bis drei von 100 000 Menschen. Doch der dramatische Verlauf und berühmte Betroffene wie der Physiker Stephen W. Hawking oder der Maler Jörg Immendorff haben die Krankheit bekannt gemacht. Sonja Balmer gehört zu den ganz wenigen Menschen, die schon seit vielen Jahren mit ALS leben. Nach ihrem Entschluss, alle heute verfügbaren Mittel und Methoden der modernen Medizin und Pflege zu beanspruchen, ist das bittere Ende aufgeschoben, aber nicht aufgehoben. Das Weiterleben in dieser gefahrvollen Warteschlaufe unbekannter Länge ist eine nicht alltägliche Erfahrung, die Sonja Balmer anschaulich schildert. Sonja Balmer ist am ganzen Körper gelähmt, wird künstlich ernährt und ist nach einem Luftröhrenschnitt ständig auf eine Beatmungsmaschine angewiesen. Wie geht sie mit dieser Abhängigkeit um – von Menschen in der Pflege, von Maschinen? Wie erlebt sie das Gesundheitssystem und seine Akteure? Welche Möglichkeiten für ein selbstbestimmtes Leben gibt es noch für sie? In aller Offenheit spricht Sonja Balmer über ihre Nöte und wenigen Freuden. Das Buch geht auf Gespräche zurück, die Sonja Balmer mit dem Neurologen Gerhard Jenzer führte. Er hat aufgezeichnet, was sie ihm berichtete. Diesen Innenansichten ist eine ausführlichen Einleitung vorangestellt, in der Gerhard Jenzer zusätzliche Informationen zu Krankheit und Therapie liefert und vor dem Hintergrund seiner reichen Erfahrung als Arzt eigene Gedanken zur Thematik entwickelt. Das so entstandene eindrückliche Zeugnis zeigt, was es heißt, der modernen Medizin das Überleben zu verdanken und gleichzeitig im System von Pflegemaßnahmen und Apparaten gefangen zu sein.</p>" }, coverImagePaths: ["13.1 In der Überlebensfalle.png", "13.2 In der Überlebensfalle Autoren.png"], oldIds: [36] },
		{ titles: { de: "Dieses Buch ist geblieben" }, author: "Unbekannt", published: "2020-01-01", contents: { de: "<p>Peter erkrankt an ALS. Zuerst wird die Krankheit ignoriert und wegdiskutiert. Nachdem die Krankheit akzeptiert ist, beginnt Dank der Hilfe der Nachbarn ein neuer Lebensabschnitt. Die Höhen und Tiefen in den letzten Lebensjahren werden - teilweise augenzwinkernd - ausführlich geschildert, um anderen Kranken zu zeigen, dass auch mit einer schweren Krankheit das Leben lebenswert bleibt.</p>" }, coverImagePaths: ["14.1 Dieses Buch ist geblieben.jpg", "14.2 Dieses Buch ist geblieben Vorwort.png"], oldIds: [37] },
		{ titles: { de: "Dienstags bei Morrie" }, author: "Mitch Albom", published: "1997-01-01", contents: { de: "<p>Morrie Schwartz ist vor 20 Jahren Mitch Alboms Universitätsprofessor gewesen. Als dieser erfährt, dass sein ehemaliger Professor schwer erkrankt ist und bald sterben wird, beginnt der erfolgreiche Sportjournalist Mitch Albom seinen alten Lehrer, Freund und Coach regelmäßig zu besuchen. Morrie ist an der tödlich verlaufenden Amyotrophen Lateralsklerose (ALS) erkrankt. Nach einem gehaltvollen Leben voller Freude, Familie, Unterrichten und Musik werden seine Aktivitäten nun durch die zunehmende Lähmung von Tag zu Tag mehr einschränkt. Mitch, der zu dieser Zeit damit kämpft, seine Unzufriedenheit mit seinem eigenen Leben und seiner Karriere zu definieren, öffnen die 14 Dienstagsbesuche, die ihrem Wiedersehen folgen, wieder die Augen für die Dinge, die ein Leben erfüllt machen. Diese Gespräche über das Leben und unsere Kultur, über Ehe und Familie, über die Arbeit und soziales Engagement, über das Verzeihen, über Glück und Abschiednehmen, über Reue und die Angst vor dem Älterwerden lassen nicht nur den Professor in Ruhe den eigenen Tod entgegennehmen – sie verändern auch Mitch Alboms Leben für immer.</p>" }, coverImagePaths: ["15.1 Dienstags bei Morrie.jpg", "15.2 Dienstags bei Morrie gelb.jpg", "15.3 Dienstags bei Morrie gelb.png"], oldIds: [38] },
		{ titles: { de: "Weisheit des Lebens" }, author: "Morrie Schwartz", published: "1995-01-01", contents: { de: "<p>„Lernen Sie, wie man lebt, dann wissen Sie, wie man stirbt; lernen Sie, wie man stirbt, dann wissen Sie, wie man lebt.“ (Morrie Schwartz) Morrie Schwartz wird 1917 als Sohn jüdisch-russischer Emigranten in Chicago geboren. Nach dem Krieg studiert er Soziologie und lehrt anschließend als Mitbegründer der Sozialpsychologie an der Brandeis University in Waltham, Massachusetts. Mit 77 Jahren wird dem Soziologie-Professor die Diagnose ALS gestellt. Von Beginn seiner Krankheit bis zu seinem Tod macht Morrie einen Lernprozess durch, den er in diesem Buch beschreibt. Es geht um das Akzeptieren seiner Krankheit, um Vergangenheitsbewältigung, um den Umgang mit seinen Gefühlen, um seine spirituelle Verbindung und um den Abschied von seinem Leben. Aus seiner verbleibenden Lebenszeit schöpft er das Beste heraus und macht eine Art Fest daraus, an dem er viele Freunde teilhaben lässt. Morries Vermächtnis ist ein emphatisches Plädoyer dafür, das Leben mit all seinen Achterbahnfahrten bewusst zu leben und zu genießen. Aus seiner persönlichen Geschichte heraus beschreibt er, wie man gefasst und gelassen seinen eigenen Weg suchen, finden und beschreiten kann. Seine Einsichten und Erkenntnisse sind voller Weisheit, Würde, Humor und Kampfgeist. Lebenshilfe im besten Sinne: inspirierend, anrührend und ermutigend – und eine ergreifende Liebeserklärung an das Leben. Morrie Schwartz starb am 4. November 1995 friedlich bei sich zu Hause.</p>" }, coverImagePaths: ["16.1 Weisheit des Lebens.jpg", "16.2 Weisheit des Lebens.jpg"], oldIds: [39] },
		{ titles: { de: "Atemlos" }, author: "Sonja Balmer", published: "2020-01-01", contents: { de: "<p>Sonja Balmer war 28 Jahre alt, als sie mit der Diagnose ALS konfrontiert wurde. Sie wird 1972 im Kanton Solothurn in der Schweiz geboren. Nach einer kaufmännischen Ausbildung und verschiedenen Tätigkeiten im Sozialbereich beginnt sie trotz ihrer ALS-Erkrankung ein Studium der Tierpsychologie sowie eine Kunstausbildung. Sie präsentiert ihre Bilder in mehreren eigenen Ausstellungen und bereits 2001 erscheint ihr Buch „Gedanken sind Früchte“. Sonja Balmer ist eine der wenigen ALS-Patientinnen, die seit mehr als sechs Jahren mit der Krankheit lebt. In „Atemlos“ schildert sie, wie die zunehmende Pflegebedürftigkeit und Abhängigkeit ihren Alltag verändern. Sie ist inzwischen 24 Stunden auf eine Beatmungsmaschine angewiesen. Sie erzählt von einer Kreuzfahrt, die sie zusammen mit Elektrorollstuhl, Arzt und zahlreichen Hilfspersonen und Hilfsmitteln unternimmt. Sie setzt sich mit schwierigen Reaktionen, mit denen sie konfrontiert wird, auseinander und beschreibt die große Bedeutung von Freundschaften. Das Wissen um die zeitliche Begrenzung ihres Lebens sieht sie als Herausforderung an, ihren Alltag ganz normal zu leben. „Atemlos“ ist das eindrucksvolle Buch einer jungen lebenslustigen Frau, ihrem Willen zur Selbstbestimmung und dem Wunsch nach Würde.</p>" }, coverImagePaths: ["17.2 Atemlos Autorin.jpg"], oldIds: [40] },
		{ titles: { de: "Gestohlene Zeit. Eine Liebeserklärung" }, author: "Carola Arndt", published: "2020-01-01", contents: { de: "<p>Das Buch „Gestohlene Zeit“ ist eine Aufarbeitung von mehr als elf gemeinsamen Ehejahren von Carola Arndt und ihrem an ALS erkrankten Mann. Auf die Idee ein Buch zu schreiben brachte sie ihr Mann, als ihn die Krankheit bereits an den Rollstuhl fesselte. „Du sollst eine Erinnerung haben, nicht nur im Geist, denn sicher wirst Du mich um Jahre überleben und auf diesem Wege bleibe ich unsterblich. Außerdem möchte ich allen anderen Mut machen, dass das Leben weitergeht, auch wenn das Ende vorbestimmt ist.“ Diese Worte waren für Carola Arndt der Beginn dieser Zeitreise. Nachts, wenn ihr Mann nicht schlafen konnte, brachte sie ihre Gedanken zu Papier. Jedes Kapitel las sie ihm vor und ließ sich seine Gedanken schildern. Je mehr Zeilen sie schrieb, umso sicherer war sie, dass dieses Buch für alle Kranken ein Begleiter sein kann. Denn was sie und ihr Mann trotz allem erlebt haben, soll Hoffnung geben, Hoffnung auf ein LEBEN – auch im Angesicht des Todes. Es hatte sich soviel in ihrem täglichen Leben geändert, seine Behinderung ließ immer weniger Normalität zu und während des Schreibens konnte sie sich zurücksehnen, in die Zeiten als auch sie noch “Durchschnitt“ waren. Das Buch zeigt das Schöne und das Schlechte der gemeinsamen Jahre. Ehrlich, offen und emotional vermittelt es alle Gefühle, inneren Zweifel und die empfundene Ohnmacht und am Ende jedes Kapitels steht ein Gedicht, das die Stimmung von Carola Arndt in der jeweiligen Zeit wiedergibt. Das Hauptanliegen ihres Mannes war es zu zeigen, dass alles im Leben zu ertragen ist, solange man Menschen um sich hat, die man liebt. Keine Krankheit, keine Behinderung darf soweit führen, dass man im Abseits steht, dass man nur noch zweite Wahl ist und seinen Wert als Mensch verliert. Vielmehr sollte jeder damit rechnen, selbst schwer zu erkranken und er sollte sich vorstellen, wie er dann behandelt werden möchte. Dieses Buch bricht mit einigen Tabuthemen unserer materiell eingestellten Gesellschaft, es zeigt, dass Liebe nichts mit einer rosaroten Brille zu tun hat, es ist viel, viel mehr: Vertrauen, Kraft, Mut und ein wenig Verrücktheit. Kurzum: Jemanden wirklich zu lieben bedeutet, ihn in keiner Lebenslage im Stich zu lassen, für und mit ihm zu kämpfen, ihn aufzufangen, zu trösten, mit ihm zu lachen und ihn spüren zu lassen – er ist es wert.</p>" }, coverImagePaths: ["18.1 Gestohlene Zeit - Eine Liebeserklärung.png", "18.2 Gestohlene Zeit Rezensionen - Eine Liebeserklärung.jpg"], oldIds: [41] },
		{ titles: { de: "Geschenkte Lebensjahre: Wir waren trotz ALS-Diagnose sehr glücklich" }, author: "Edith Maria Soremba", published: "2020-01-01", contents: { de: "<p>In dem vorliegenden Buch schildert die Autorin den Krankeitsverlauf der ALS (Amyotrophe Lateralsklerose) bei ihrem Mann von den ersten Anzeichen über die Diagnose bis zu seinem Tod, der allerdings nicht unmittelbar durch seine Krankheit ausgelöst wurde. Der Text enthält konkrete Pflegetipps, die nicht nur ALS-Patienten und ihre Hauspflege betreffen, sondern auch anderen Patienten mit schwerwiegenden Erkrankungen und deren Angehörigen eine wertvolle Hilfe sein kann. Außer dem Aufzeigen von praktischen Hilfen, einem ausgewogenen Ernährungskonzept und hilfreichen Medikamenten zeigt die Verfasserin, dass Respekt vor dem Kranken, die Erhaltung seiner Würde, das Wecken seines eigenen Engagements im Umgang mit der Krankheit und natürlich große Zuneigung den Krankheitsverlauf positiv beeinflussen. Es fehlen natürlich auch nicht ausführliche Hinweise zur Patietenverfügung, zum Umgang mit Ämtern und Versicherungen, zum Anfertigen eines Pflegeprotokolls. Die Idee dieses Buches entstand bereits zu Lebzeiten des Ehemanns. Die Autorin betrat intuitiv neue Wege in der Pflege, die sie durch gezielte Lektüre vertiefte. Das Buch verfügt im Anhang daher auch über ein Literatur- und Adressverzeichnis, vor allem auch zahlreiche Internetadressen. Die behandelnden Ärzte zeigten sich positiv überrascht, wie durch die Pflege der bis dahin bei anderen Patienten rasche Fortgang der Krankheit aufgehalten werden konnte. Die Fachleute ermunterten die Autorin, ihre Aufzeichnungen zu veröffentlichen, anderen Betroffenen, aber auch dem Pflegepersonal und Ärzten eine wertvolle Hilfe zu geben. Doch das Buch ist noch mehr. Es ist auch eine ‚Mutspender-Lektüre’ für alle, die an die Kraft der Liebe glauben. Der Text ist daherangereichert mit sprechenden Bidern und persönlichen Einblicken in das Leben der Familie Soemba, das geprägt ist von einem großen Zusammenhalt und christlichen Wertvorstellungen. Edith-Maria Soremba ist Lehrerin im Ruhestand und qualifizierte Lern- und Legasthenietherapeutin, betreibt mit ihrem Sohn Michael eine Gemeinschaftspraxis für integrative Lerntheraphie. Als Autorin im Legasthenieberech hat sie sich bereits bundesweit einen Namen gemacht. Ihr Buch ‚Legasthenie muss kein Schicksal sein’ ist bereits in der 6.Auflage bei Herder-Spektrum erschienen. Frau Soremba ist zudem Mutter von sechs Kindern und lebt in Vechta.</p>" }, coverImagePaths: ["19.1 Geschenkte Lebensjahre.png"], oldIds: [42] },
		{ titles: { de: "Bis zum letzten Atemzug. Ein Plädoyer für menschenwürdiges Sterben" }, author: "Christine Lehrke", published: "2020-01-01", contents: { de: "<p>Christine Lehrke und ihr Mann Klaus führen nach turbulenten Zeiten endlich eine harmonische, glückliche Beziehung, als sie plötzlich die furchtbare Diagnose aus dem Gleichgewicht bringt: Klaus hat ALS. Für Klaus gibt es nur einen Ausweg. Um nichts in der Welt will er sich diesem qualvollen Sterben aussetzen, sondern seinem Leben vorher ein Ende setzen. Dieses Buch beschreibt den schwierigen Weg zweier Menschen, die nur ein Ziel haben: menschenwürdig zu leben und zu sterben.</p>" }, coverImagePaths: ["20.1 Bis zum letzten Atemzug.jpg", "20.2 Bis zum letzten Atemzug.png"], oldIds: [43] },
		{ titles: { de: "Nur ein Funken Hoffnung" }, author: "Ulla", published: "2020-01-01", contents: { de: "<p>Ulla erfährt mit ihren 41 Jahren, dass sie an ALS - einer seltenen Nervenkrankheit leidet, die sie von Monat zu Monat mehr in den Rollstuhl zwingt. Diese Krankheit ist unheilbar, die Ärzte können nur machtlos zusehen. Sie will nicht zum absoluten Pflegefall werden. Nicht einen einzigen Tag in ihrem Leben, wird sie ihre Krankheit akzeptieren und beschließt, außergewöhnliche Maßnahmen zu ergreifen. In Deutschland erfährt sie über Heilungsmöglichkeiten in einem fernen Land. Sie lässt alles stehen und liegen und fliegt, trotz ihrer Behinderung, für drei Monate nach Sri Lanka. Ihr Abenteuer beginnt.</p>" }, coverImagePaths: ["21.1 Nur ein Funken Hoffnung.jpg"], oldIds: [44] },
		{ titles: { de: "Rose & Gebrochen Deutsch" }, author: "Christian Sighisorean", published: "2020-01-01", contents: { de: "<p>Der hier schreibt, schreibt um sein Leben. Und weiß doch, dass er es verlieren wird. Christian Sighisorean erfuhr 2006 von seiner Krankheit ALS, die binnen weniger Jahre zum Tode führt. Und schrieb dieses Gedicht: „Das Schönste an der Diagnose Amyotrophe Lateralsklerose kommt zum Schluss die Rose“. Ein Text am Abgrund und doch von großer Leichtigkeit und Gelassenheit. Diese Balance zwischen Todesnähe und Sprachfreude prägt viele Texte dieses Bandes, etwa „Den ersten Tag“, mit den Stationen des Leidensweges Vers für Vers. Oder die „Gen-Tauschbörse“, an der das SOR-Gen oder das ALS-Gen gegen das TRA-Gen oder das SE-Gen getauscht werden können. Spiel mit Sprache, Wörtern, Klängen. Texte in der Tradition von Ernst Jandl und Robert Gernhardt. Herzergreifend das Gedicht „Papa, warum“, Dialog zwischen dem Vater und seinen Kindern. Die Kinder stellen Fragen nach der für sie unerklärlich fortschreitenden Krankheit. Und geben immer neue Ratschläge: „Aber Papa, ... ich zeige es Dir, erst mit dem einen Fuß ... dann mit dem andern, das ist doch babyig“. Der Themenkreis „Gebrochen Deutsch“ umfasst politische Gedichte. Sighisorean, der Deutsche aus Rumänien, provoziert mit bissigem Sprachwitz und stellt unerbittliche Fragen, ungemütlich, aber höchst anregend. Dies ist sein erster Gedichtband. Ein außerordentliches Ereignis!</p>" }, coverImagePaths: ["22.1 Rose und Gebrochen Deutsch.jpg"], oldIds: [45] },
=======
        it: '<p>Per molti versi, avrei preferito non dover pubblicare questo libro, che non esisterebbe se una delle mie scrittrici preferite - non posso nemmeno incominciare a spiegare l\'importanza che ha avuto nella mia vita, professionale ma soprattutto personale, il suo "Orto di un perdigiorno" - non si trovasse in condizioni di salute che non lasciano campo alla speranza. [...] Un dono meraviglioso quello che Pia Pera ha fatto a se stessa e che poi ha deciso di condividere con i suoi lettori.</p>',
      },
      coverImagePaths: [
        "8.2 Die Weisheit meines Gartens Wie die Natur mich lehrte worauf es am Ende ankommt im Leben.png",
      ],
      oldIds: [31, 47],
    },
    {
      titles: { de: "ALS und andere Ansichtssachen" },
      author: "Christian Bär",
      published: "2019-01-01",
      contents: {
        de: "<p>Amyotrophe Lateralsklerose, kurz ALS, ist eine unheilbare Erkrankung des motorischen Nervensystems. Dabei bauen sich die Nerven und infolgedessen die Muskeln ab, und deshalb verlieren die Betroffenen sukzessive die Kontrolle über sämtliche Körperfunktionen. Christian Bär ist betroffen – er erhielt die Diagnose 2016 im Alter von 38 Jahren, mitten im Leben, gerade Vater geworden. Er ist ein sportlicher, umtriebiger, vielseitig interessierter, aktiver und sympathischer Mensch, den die Krankheit mit voller Wucht aus seinem bisher „normalen“ Familien-, Privat- und Arbeitsleben katapultiert. Seinen Krankheitsverlauf schildert Bär nüchtern und manchmal fast sarkastisch, vom ersten Zucken seines rechten Bizeps über den Verlust nahezu aller Fähigkeiten bis auf die ihm nunmehr noch verbleibende Kontrolle über seine Augen. Begonnen als Blog, für den er 2019 verdientermaßen den Grimme Online Award erhielt, ist dieses Buch ein beeindruckendes Zeugnis eines Menschen, der trotz seiner Krankheit Lebensmut und Humor bewahrt.</p>",
      },
      coverImagePaths: ["24.2 Bevor ich gehe - Erinnerungen.png"],
      oldIds: [24],
    },
    {
      titles: { de: "Leben und gleichzeitig sterben" },
      author: "Sarah Braun",
      published: "2020-01-01",
      contents: {
        de: '<p>Sarah Braun erhält im Alter von 24 Jahren die Diagnose ALS, amyotrophe Lateralsklerose. Es ist ein Todesurteil, denn ihre Lebenserwartung beträgt noch drei bis fünf Jahre. Früher zu sterben als die meisten anderen im eigenen Umfeld ist herausfordernd, weil eine andere Lebenswelt betreten wird. Dabei zuzusehen, wie ein nahestehender Mensch stirbt, ist eine Grenzerfahrung. Dieses Buch liefert Einblicke in den Sterbeprozess aus Sicht einer Betroffenen sowie ihrer engsten Wegbegleiter*innen. Es will Hoffnung darauf machen, dass es sich lohnt, dieses Leben zu leben. "Ich für meinen Teil möchte nach meinem Tod eine Hummel werden. Hummeln sehen lustig aus, sind flauschig, tun Gutes aus purem Egoismus und weil ihnen niemand gesagt hat, dass sie eigentlich nicht fliegen können, tun sie es trotzdem. Und vom Baum aus zusehen kann ich dann auch." Sarah Braun</p>',
      },
      coverImagePaths: ["22.1 Leben und gleichzeitig sterben.jpg", "22.2 Leben und gleichzeitig sterben.png"],
      oldIds: [25],
    },
    {
      titles: { de: "Das Jahr ohne Worte" },
      author: "Alexandra",
      published: "2020-11-29",
      contents: {
        de: '<p>Fünf Jahreszeiten einer Liebe. Eine überwältigende Geschichte. Eine unglaubliche Geschichte. Und doch eine wahre Geschichte. Alles beginnt mit einer großen Liebe. "Sowohl als auch" heißt das Café in Prenzlauer Berg, in dem Syd Theo kennenlernt. Theo ist Filmemacher, alleinstehend, charismatisch. Syd weiß sofort, dass es die Art von Liebe ist, die sie vermutlich nur einmal erleben wird. Die beiden bekommen ein Kind, ziehen zusammen, erleben großes Glück und überstehen kleine Krisen. Doch dann erhält Theo eine niederschmetternde Diagnose: ALS. Die Krankheit, an der auch Stephen Hawking litt. Von dem Mann, in den Syd sich einst verliebt hat, ist Tag für Tag weniger übrig. Und doch kämpft sie um ihn. Sie will das, was von ihrem Glück noch übrig ist, unbedingt bewahren. Bis sie eines Tages eine ungeheuerliche Entdeckung macht.</p>',
      },
      coverImagePaths: ["3.1 Das Jahr ohne Worte.png", "3.2 Das Jahr ohne Worte.png"],
      oldIds: [26],
    },
    {
      titles: { de: "Ich will noch leben bevor ich sterbe" },
      author: "Unbekannt",
      published: "2012-01-01",
      contents: {
        de: "<p>Nach der niederschmetternden Diagnose ALS im Jahr 2012 hätte ich aufgeben können, aber ich entwickelte einen unbändigen Überlebenswillen. Ich wollte Antworten und begab mich auf meine Reise und fand sie in der Liebe, der Hoffnung, der Epigenetik und meiner mentalen Gesundheit durch Hypnose. Heute bin ich glücklich und dankbar für die vergangenen Jahre, in denen ich meine Antworten fand. Als ich den Sattel meiner Pferde gegen einen Rollstuhl tauschen musste, hätte ich niemals gedacht, wieder richtig glücklich zu werden. Du denkst, du kannst dein Schicksal nicht ändern? Wir können entscheiden, wie wir unser Leben betrachten, jeden Tag aufs Neue. Dieses Buch ist für jeden, der die Kraft in sich selbst entdecken möchte, der jenseits der Hoffnungslosigkeit neue Wege finden möchte. Es ist ein Buch über die Macht, die uns innewohnt – wir müssen sie nur finden.</p>",
      },
      coverImagePaths: ["4.1 Ich will noch leben bevor ich sterbe.png", "4.2 Ich will noch leben bevor ich sterbe.png"],
      oldIds: [27],
    },
    {
      titles: { de: "Such dir einen schönen Stern am Himmel" },
      author: "Nina Zacher",
      published: "2020-01-01",
      contents: {
        de: "<p>Das Schicksal trifft Nina Zacher aus heiterem Himmel. Mit Anfang 40 wird bei der vierfachen Mutter ALS diagnostiziert, eine Erkrankung, bei der der Körper langsam zerfällt, der Geist aber hellwach bleibt. Doch statt sich zurückzuziehen und auf den Tod zu warten, geht Nina Zacher an die Öffentlichkeit. Zehntausende folgen der jungen Frau und Mutter von vier kleinen Kindern auf Facebook. Ehrlich und direkt schreibt sie über ihr Leben, ihr Leiden und ihr Sterben und beweist dabei ungeheure Stärke und Lebensmut. Bis kurz vor ihrem Tod teilt sie ihre Gedanken, und als sie sich fast nicht mehr bewegen kann, schreibt sie ihre Texte mit einem augengesteuerten Spezial-Computer. Ihren größten Traum, ein Buch zu schreiben, kann sie nicht mehr verwirklichen. Doch ihr Mann erfüllt ihr diesen letzten Wunsch und löst damit sein Versprechen ein, den entschlossenen Kampf seiner Frau gegen die heimtückische Krankheit weiterzuführen. So ist ein tiefberührendes Vermächtnis entstanden, das über den Tod hinausgeht. Für Karl-Heinz Zacher ist es ein Zeugnis ihrer unerschütterlichen Liebe, das ihm nun ermöglicht, die Familie in ein Leben ohne seine Frau zu führen. Und es ist eine tiefgründige Antwort auf die Frage, was am Ende wirklich zählt.</p>",
      },
      coverImagePaths: [
        "5.1 Such dir einen schönen Stern am Himmel.jpg",
        "5.2 Such dir einen schönen Stern am Himmel.png",
      ],
      oldIds: [28],
    },
    {
      titles: { de: "Wer stirbt denn nicht?" },
      author: "Philipp Hanf",
      published: "2020-01-01",
      contents: {
        de: "<p>Philipp Hanf erlebte diesen Moment vor fünf Jahren, mit 47: Er erhielt die Diagnose, an Amyotropher Lateralsklerose erkrankt zu sein. Ein Schock. Für ihn, für seine Frau, für seine Familie. Die Diagnose setzte vieles auf einmal in Bewegung. Philipp Hanf hörte auf zu arbeiten, und sein Leben verlief plötzlich wie im Zeitraffer. Da ihm die Schulmedizin wenig zu bieten hatte, betrat er unvoreingenommen neue Pfade: Er traf Geistheiler und Schamanen, ging den Fähigkeiten von Shaolin-Mönchen auf den Grund, stand seinem inneren Kind gegenüber oder praktizierte uralte vergessene Yoga-Techniken. Er lernte, ungeahnte Kräfte freizusetzen, auf sein Herz zu hören und mit Konventionen zu brechen. Er suchte nach Alternativen, der Krankheit zu begegnen – und fand darüber zu sich selbst. Dieses Buch ist weder eine schwermütige Krankheitsgeschichte noch ein dogmatisches spirituelles Regelwerk. Substanz gewinnt es, weil Philipp Hanf persönliche Biografie und Prägungen mit vielfältigen Therapie- und Denkansätzen in Beziehung setzt. Als versierter Schulmediziner wendet er sich alternativen medizinischen Konzepten zu – ohne Gefahr zu laufen, blind diffusen Heilslehren zu verfallen. Im Gegenteil: Er entdeckt viele Schnittstellen zur traditionellen westlichen Medizin. Philipp Hanf ist durchaus dankbar für das, was ihm widerfahren ist, auch wenn ihm nicht mehr viel Zeit bleibt. Heute weiß er: Heilung und Tod schließen einander nicht aus. »Wer stirbt denn nicht« erklärt die Genese dieses für manch einen sicherlich überraschenden Fazits. Philipp Hanf lädt seine Leser und Leserinnen ein, den Weg dieser Erkenntnis mit ihm gemeinsam zu beschreiten. Anstatt eines Abgesangs erwartet sie ein leidenschaftliches Plädoyer fürs Leben – offen, einleuchtend und keineswegs humorlos.</p>",
      },
      coverImagePaths: [
        "6a Wer stirbt denn nicht.jpg",
        "6b.1 Wer stirbt denn nicht.jpg",
        "6b.2 Wer stirbt denn nicht.jpg",
      ],
      oldIds: [29],
    },
    {
      titles: { de: "Zu den Ursprüngen oder Emil und die Weberknechte" },
      author: "Emil Weber",
      published: "2020-01-01",
      contents: {
        de: "<p>Der Mensch fährt und Gott hält den Lenker. Durch die Pilgramgasse in Wien ist Emil Weber damals geradelt, auf seinem Canyon-Bike, es war kalt. Er merkte, dass er die Finger seiner rechten Hand nach dem Bremsen nicht mehr zurückbiegen konnte und musste sie mit der linken Hand wieder aufbiegen. Im November 2016 war das. Drei Monate später bekam er die Diagnose ALS – Amyotrophe Lateralsklerose. Eine seltene, aber unheilbare Nervenkrankheit, die durch die weltweite Spendenaktion ICE-Bucket-Challenge bekannt wurde. Bei der Diagnose betrug Emil Webers statistische Lebenserwartung zwei bis vier Jahre. Früher machte Herr Weber viel Sport. Noch 2017 radelte er, schon in Kenntnis seiner Krankheit, fünf Wochen lang entlang der wichtigsten Flüsse Österreichs zu deren Ursprüngen. 2700 km, 22.000 Höhenmeter. 16 Freunde organisierten sich so, dass er nie allein radelte. Später schrieb Emil Weber das nun vorliegende Buch. Für seine 16 Weberknechte. Der erste Satz im Prolog lautet: „Ich bin froh, dass ich diese Zeilen noch schreiben kann.“ Heute schreibt Emil Weber mit einem augengesteuerten Computer. Der Reinerlös dieses Buches kommt ausschließlich dem Forum ALS – Verein für multiprofessionelle ALS-Hilfe mit Sitz in Wien zugute.</p>",
      },
      coverImagePaths: [
        "7.1 Zu den Ursprüngen oder Emil und die Weberknechte.jpg",
        "7.2 Zu den Ursprüngen oder Emil und die Weberknechte.png",
      ],
      oldIds: [30],
    },
    {
      titles: { de: "Der Sinn des Lesens" },
      author: "Pieter Steinz",
      published: "2016-01-01",
      contents: {
        de: "<p>Im Sommer 2013 wurde bei dem niederländischen Journalisten und Buchliebhaber Pieter Steinz die unheilbare Nervenkrankheit ALS diagnostiziert. Nur wenige Monate später begann er eine Reihe von 52 kurzen Essays über seine Krankheit und vor allem über seine Lieblingsbücher und -autoren zu schreiben, über Dickens, Alexandre Dumas und Shakespeare, über Stevenson, Thomas Mann und Proust, Ovid und Seneca – aber auch über Carl Barks, Jacques Brel und Astrid Lindgren. Pieter Steinz starb am 29. August 2016 in Haarlem. In diesen ebenso anrührenden wie lebensfrohen und humorvollen Betrachtungen setzte Pieter Steinz seinen körperlichen Verfall in Beziehung zur Weltliteratur. So wendet er sich Oscar Wildes »Bildnis des Dorian Gray« zu, wenn er über die Veränderungen seines Körpers nachdenkt, dem »Hungerkünstler« Kafkas, wenn er über die zunehmend auftretenden Schwierigkeiten bei der Nahrungsaufnahme berichtet; Andersens »kleiner Meerjungfrau«, die sich zwischen Tanzen und Sprechen entscheiden muss, dient ihm als Folie der Geschichte seines Stimmverlusts. Trotz des düsteren Grundthemas sind diese kunstvoll gebauten Essays voll uneitler, ja tapferer Ausstrahlung, was in Holland bei Erscheinen zahlreiche Reaktionen auslöste.</p>",
      },
      coverImagePaths: ["9.1 Sinn des Lesens.jpg", "9.2 Sinn des Lesens.png"],
      oldIds: [32],
    },
    {
      titles: { de: "Ich bin eine Insel: Gefangen im eigenen Körper" },
      author: "Sandra Schadek",
      published: "2020-01-01",
      contents: {
        de: "<p>Die Diagnose Amyotrophe Lateralsklerose (ALS) war ein enormer Schock für mich; ich konnte mir nicht vorstellen, dass ich wirklich an einer so schweren, unheilbaren und tödlichen Krankheit leiden sollte – aber ich wurde vom Gegenteil überzeugt. Also habe ich beschlossen, der ALS nicht kampflos das Feld zu überlassen. Ich habe gelernt, mich mit der Krankheit zu arrangieren. Es liegt an mir, wie die letzten Jahre meines Lebens verlaufen. Denn eines steht fest: Das Leben geht weiter, so oder so! Sandra Schadeks Körper gehorcht ihr nicht mehr: Die tödliche Krankheit ALS, die durch Stephen Hawking ins Bewusstsein der Öffentlichkeit drang, hat ihre Nerven und Muskeln gelähmt, sprechen kann sie kaum noch. Geblieben sind der jungen Frau trotz allem ein unglaublicher Optimismus und die Fähigkeit, Kraft aus ihrer Situation zu schöpfen – und ihr sogar humorvolle Seiten abzugewinnen.</p>",
      },
      coverImagePaths: [
        "10.1 Ich bin eine Insel Gefangen im eigenen Körper.jpg",
        "10.2 Ich bin eine Insel Gefangen im eigenen Körper.jpg",
      ],
      oldIds: [33],
    },
    {
      titles: { de: "Rudern ohne Ruder - Mein Leben und Sterben mit ALS" },
      author: "Ulla-Carin Lindquist",
      published: "2020-01-01",
      contents: {
        de: '<p>An ihrem 50. Geburtstag erfuhr die schwedische Nachrichtenmoderatorin Ulla-Carin Lindquist, dass sie an der tödlichen Krankheit ALS erkrankt sei. Unsentimental und dafür umso eindrucksvoller berichtet Lindquist von ihrem körperlichen Verfall, den Gesprächen mit ihren Kindern, ihrer Verwundbarkeit, der zunehmenden Hilflosigkeit, von Trauer, Verzweiflung und Akzeptanz. Ein Buch voll dramatischer Intensität und bittersüßer Liebe zum Leben angesichts des nahenden Todes. „DIESES BUCH IST MEIN DEBUT UND MEIN FINALE" Die populäre schwedische Nachrichtenmoderatorin Lindquist berichtet über ein Jahr mit ALS, ihr letztes Lebensjahr. Ein Buch voll dramatischer Intensität und bittersüßer Liebe zum Leben angesichts des nahenden Todes. ,Anspruchsvoll, mit großer Stilsicherheit und bar jeder Sentimentalität. absolut fesselnd und zugleich bestürzend."Svenska Dagbladet"- Rudern ohne Ruder - ist weit mehr als nur eine Art ALS-Schicksal. Es ist eine großartige Darstellung dessen, was es heißt, ein Mensch zu sein. Zu existieren und anzuerkennen, dass wir nicht ewig leben."Norrkopings Tidningar.</p>',
      },
      coverImagePaths: [
        "11.1 Rudern ohne Ruder - Wein Leben und Verben mit ALS.png",
        "11.2 Rudern ohne Ruder - Wein Leben und Verben mit ALS.jpg",
        "11.3 Rudern ohne Ruder - Wein Leben und Verben mit ALS.png",
      ],
      oldIds: [34],
    },
    {
      titles: { de: "Am Leben Sein: Ein Leben mit Amyotropher Lateralsklerose" },
      author: "Ines Schmidt",
      published: "2020-01-01",
      contents: {
        de: "<p>Die Diagnose ALS erhielt Paul im Alter von 17 Jahren. In den Jahren des Leidens nutzte er seine besonderen musikalischen Begabungen, seine künstlerischen Ambitionen und seine mentale Stärke und hinterließ damit wunderbare Spuren. Seine außergewöhnliche Geschichte, begleitet von seiner Musik auf einer Audio-CD und den „Ansichten eines Sterbenden“ in den zahlreichen Fotos, eröffnet einen besonderen Blick auf das Leben, unser Leben und das Sterben. Dennoch bleibt die Geschichte nicht bei Pauls Leidensweg stehen, sie steht gleichsam vertretend für alle sterbenskranken Menschen, die trotz ihres außerordentlich großen Leides immer wieder Kraft schöpfen und ihre Energien freisetzen, und die liebevoll begleitet werden von ihren Nächsten. Themen wie Leid, Mitgefühl, Würde, Leben, Sterben und Spiritualität rücken dabei unweigerlich in den Fokus der Betrachtung. Am Ende steht eine alles entscheidende Konsequenz, die wir Erdenbürger unser gesamtes Leben lang nie vergessen sollten: DIE LIEBE IST DER SINN UNSERES LEBENS!</p>",
      },
      coverImagePaths: ["12.1 Am Leben sein.jpg", "12.2 Am Leben sein.jpg"],
      oldIds: [35],
    },
    {
      titles: { de: "In der Überlebensfalle: Erfahrungen einer ALS-Patientin" },
      author: "Sonja Balmer",
      published: "2020-01-01",
      contents: {
        de: "<p>Seit 2001 weiß Sonja Balmer, dass die Lähmungserscheinungen und Atembeschwerden, an denen sie schon länger leidet, einen Namen haben: Die heute 36-Jährige leidet an Amyotropher Lateralsklerose (ALS). Diese unheilbare neurologische Erkrankung führt in einem langsam fortschreitenden Prozess zu irreversibler Muskellähmung einschließlich der Atemmuskulatur und endet tödlich. ALS ist selten: Jährlich erkranken ein bis drei von 100 000 Menschen. Doch der dramatische Verlauf und berühmte Betroffene wie der Physiker Stephen W. Hawking oder der Maler Jörg Immendorff haben die Krankheit bekannt gemacht. Sonja Balmer gehört zu den ganz wenigen Menschen, die schon seit vielen Jahren mit ALS leben. Nach ihrem Entschluss, alle heute verfügbaren Mittel und Methoden der modernen Medizin und Pflege zu beanspruchen, ist das bittere Ende aufgeschoben, aber nicht aufgehoben. Das Weiterleben in dieser gefahrvollen Warteschlaufe unbekannter Länge ist eine nicht alltägliche Erfahrung, die Sonja Balmer anschaulich schildert. Sonja Balmer ist am ganzen Körper gelähmt, wird künstlich ernährt und ist nach einem Luftröhrenschnitt ständig auf eine Beatmungsmaschine angewiesen. Wie geht sie mit dieser Abhängigkeit um – von Menschen in der Pflege, von Maschinen? Wie erlebt sie das Gesundheitssystem und seine Akteure? Welche Möglichkeiten für ein selbstbestimmtes Leben gibt es noch für sie? In aller Offenheit spricht Sonja Balmer über ihre Nöte und wenigen Freuden. Das Buch geht auf Gespräche zurück, die Sonja Balmer mit dem Neurologen Gerhard Jenzer führte. Er hat aufgezeichnet, was sie ihm berichtete. Diesen Innenansichten ist eine ausführlichen Einleitung vorangestellt, in der Gerhard Jenzer zusätzliche Informationen zu Krankheit und Therapie liefert und vor dem Hintergrund seiner reichen Erfahrung als Arzt eigene Gedanken zur Thematik entwickelt. Das so entstandene eindrückliche Zeugnis zeigt, was es heißt, der modernen Medizin das Überleben zu verdanken und gleichzeitig im System von Pflegemaßnahmen und Apparaten gefangen zu sein.</p>",
      },
      coverImagePaths: ["13.1 In der Überlebensfalle.png", "13.2 In der Überlebensfalle Autoren.png"],
      oldIds: [36],
    },
    {
      titles: { de: "Dieses Buch ist geblieben" },
      author: "Unbekannt",
      published: "2020-01-01",
      contents: {
        de: "<p>Peter erkrankt an ALS. Zuerst wird die Krankheit ignoriert und wegdiskutiert. Nachdem die Krankheit akzeptiert ist, beginnt Dank der Hilfe der Nachbarn ein neuer Lebensabschnitt. Die Höhen und Tiefen in den letzten Lebensjahren werden - teilweise augenzwinkernd - ausführlich geschildert, um anderen Kranken zu zeigen, dass auch mit einer schweren Krankheit das Leben lebenswert bleibt.</p>",
      },
      coverImagePaths: ["14.1 Dieses Buch ist geblieben.jpg", "14.2 Dieses Buch ist geblieben Vorwort.png"],
      oldIds: [37],
    },
    {
      titles: { de: "Dienstags bei Morrie" },
      author: "Mitch Albom",
      published: "1997-01-01",
      contents: {
        de: "<p>Morrie Schwartz ist vor 20 Jahren Mitch Alboms Universitätsprofessor gewesen. Als dieser erfährt, dass sein ehemaliger Professor schwer erkrankt ist und bald sterben wird, beginnt der erfolgreiche Sportjournalist Mitch Albom seinen alten Lehrer, Freund und Coach regelmäßig zu besuchen. Morrie ist an der tödlich verlaufenden Amyotrophen Lateralsklerose (ALS) erkrankt. Nach einem gehaltvollen Leben voller Freude, Familie, Unterrichten und Musik werden seine Aktivitäten nun durch die zunehmende Lähmung von Tag zu Tag mehr einschränkt. Mitch, der zu dieser Zeit damit kämpft, seine Unzufriedenheit mit seinem eigenen Leben und seiner Karriere zu definieren, öffnen die 14 Dienstagsbesuche, die ihrem Wiedersehen folgen, wieder die Augen für die Dinge, die ein Leben erfüllt machen. Diese Gespräche über das Leben und unsere Kultur, über Ehe und Familie, über die Arbeit und soziales Engagement, über das Verzeihen, über Glück und Abschiednehmen, über Reue und die Angst vor dem Älterwerden lassen nicht nur den Professor in Ruhe den eigenen Tod entgegennehmen – sie verändern auch Mitch Alboms Leben für immer.</p>",
      },
      coverImagePaths: [
        "15.1 Dienstags bei Morrie.jpg",
        "15.2 Dienstags bei Morrie gelb.jpg",
        "15.3 Dienstags bei Morrie gelb.png",
      ],
      oldIds: [38],
    },
    {
      titles: { de: "Weisheit des Lebens" },
      author: "Morrie Schwartz",
      published: "1995-01-01",
      contents: {
        de: "<p>„Lernen Sie, wie man lebt, dann wissen Sie, wie man stirbt; lernen Sie, wie man stirbt, dann wissen Sie, wie man lebt.“ (Morrie Schwartz) Morrie Schwartz wird 1917 als Sohn jüdisch-russischer Emigranten in Chicago geboren. Nach dem Krieg studiert er Soziologie und lehrt anschließend als Mitbegründer der Sozialpsychologie an der Brandeis University in Waltham, Massachusetts. Mit 77 Jahren wird dem Soziologie-Professor die Diagnose ALS gestellt. Von Beginn seiner Krankheit bis zu seinem Tod macht Morrie einen Lernprozess durch, den er in diesem Buch beschreibt. Es geht um das Akzeptieren seiner Krankheit, um Vergangenheitsbewältigung, um den Umgang mit seinen Gefühlen, um seine spirituelle Verbindung und um den Abschied von seinem Leben. Aus seiner verbleibenden Lebenszeit schöpft er das Beste heraus und macht eine Art Fest daraus, an dem er viele Freunde teilhaben lässt. Morries Vermächtnis ist ein emphatisches Plädoyer dafür, das Leben mit all seinen Achterbahnfahrten bewusst zu leben und zu genießen. Aus seiner persönlichen Geschichte heraus beschreibt er, wie man gefasst und gelassen seinen eigenen Weg suchen, finden und beschreiten kann. Seine Einsichten und Erkenntnisse sind voller Weisheit, Würde, Humor und Kampfgeist. Lebenshilfe im besten Sinne: inspirierend, anrührend und ermutigend – und eine ergreifende Liebeserklärung an das Leben. Morrie Schwartz starb am 4. November 1995 friedlich bei sich zu Hause.</p>",
      },
      coverImagePaths: ["16.1 Weisheit des Lebens.jpg", "16.2 Weisheit des Lebens.jpg"],
      oldIds: [39],
    },
    {
      titles: { de: "Atemlos" },
      author: "Sonja Balmer",
      published: "2020-01-01",
      contents: {
        de: "<p>Sonja Balmer war 28 Jahre alt, als sie mit der Diagnose ALS konfrontiert wurde. Sie wird 1972 im Kanton Solothurn in der Schweiz geboren. Nach einer kaufmännischen Ausbildung und verschiedenen Tätigkeiten im Sozialbereich beginnt sie trotz ihrer ALS-Erkrankung ein Studium der Tierpsychologie sowie eine Kunstausbildung. Sie präsentiert ihre Bilder in mehreren eigenen Ausstellungen und bereits 2001 erscheint ihr Buch „Gedanken sind Früchte“. Sonja Balmer ist eine der wenigen ALS-Patientinnen, die seit mehr als sechs Jahren mit der Krankheit lebt. In „Atemlos“ schildert sie, wie die zunehmende Pflegebedürftigkeit und Abhängigkeit ihren Alltag verändern. Sie ist inzwischen 24 Stunden auf eine Beatmungsmaschine angewiesen. Sie erzählt von einer Kreuzfahrt, die sie zusammen mit Elektrorollstuhl, Arzt und zahlreichen Hilfspersonen und Hilfsmitteln unternimmt. Sie setzt sich mit schwierigen Reaktionen, mit denen sie konfrontiert wird, auseinander und beschreibt die große Bedeutung von Freundschaften. Das Wissen um die zeitliche Begrenzung ihres Lebens sieht sie als Herausforderung an, ihren Alltag ganz normal zu leben. „Atemlos“ ist das eindrucksvolle Buch einer jungen lebenslustigen Frau, ihrem Willen zur Selbstbestimmung und dem Wunsch nach Würde.</p>",
      },
      coverImagePaths: ["17.2 Atemlos Autorin.jpg"],
      oldIds: [40],
    },
    {
      titles: { de: "Gestohlene Zeit. Eine Liebeserklärung" },
      author: "Carola Arndt",
      published: "2020-01-01",
      contents: {
        de: "<p>Das Buch „Gestohlene Zeit“ ist eine Aufarbeitung von mehr als elf gemeinsamen Ehejahren von Carola Arndt und ihrem an ALS erkrankten Mann. Auf die Idee ein Buch zu schreiben brachte sie ihr Mann, als ihn die Krankheit bereits an den Rollstuhl fesselte. „Du sollst eine Erinnerung haben, nicht nur im Geist, denn sicher wirst Du mich um Jahre überleben und auf diesem Wege bleibe ich unsterblich. Außerdem möchte ich allen anderen Mut machen, dass das Leben weitergeht, auch wenn das Ende vorbestimmt ist.“ Diese Worte waren für Carola Arndt der Beginn dieser Zeitreise. Nachts, wenn ihr Mann nicht schlafen konnte, brachte sie ihre Gedanken zu Papier. Jedes Kapitel las sie ihm vor und ließ sich seine Gedanken schildern. Je mehr Zeilen sie schrieb, umso sicherer war sie, dass dieses Buch für alle Kranken ein Begleiter sein kann. Denn was sie und ihr Mann trotz allem erlebt haben, soll Hoffnung geben, Hoffnung auf ein LEBEN – auch im Angesicht des Todes. Es hatte sich soviel in ihrem täglichen Leben geändert, seine Behinderung ließ immer weniger Normalität zu und während des Schreibens konnte sie sich zurücksehnen, in die Zeiten als auch sie noch “Durchschnitt“ waren. Das Buch zeigt das Schöne und das Schlechte der gemeinsamen Jahre. Ehrlich, offen und emotional vermittelt es alle Gefühle, inneren Zweifel und die empfundene Ohnmacht und am Ende jedes Kapitels steht ein Gedicht, das die Stimmung von Carola Arndt in der jeweiligen Zeit wiedergibt. Das Hauptanliegen ihres Mannes war es zu zeigen, dass alles im Leben zu ertragen ist, solange man Menschen um sich hat, die man liebt. Keine Krankheit, keine Behinderung darf soweit führen, dass man im Abseits steht, dass man nur noch zweite Wahl ist und seinen Wert als Mensch verliert. Vielmehr sollte jeder damit rechnen, selbst schwer zu erkranken und er sollte sich vorstellen, wie er dann behandelt werden möchte. Dieses Buch bricht mit einigen Tabuthemen unserer materiell eingestellten Gesellschaft, es zeigt, dass Liebe nichts mit einer rosaroten Brille zu tun hat, es ist viel, viel mehr: Vertrauen, Kraft, Mut und ein wenig Verrücktheit. Kurzum: Jemanden wirklich zu lieben bedeutet, ihn in keiner Lebenslage im Stich zu lassen, für und mit ihm zu kämpfen, ihn aufzufangen, zu trösten, mit ihm zu lachen und ihn spüren zu lassen – er ist es wert.</p>",
      },
      coverImagePaths: [
        "18.1 Gestohlene Zeit - Eine Liebeserklärung.png",
        "18.2 Gestohlene Zeit Rezensionen - Eine Liebeserklärung.jpg",
      ],
      oldIds: [41],
    },
    {
      titles: { de: "Geschenkte Lebensjahre: Wir waren trotz ALS-Diagnose sehr glücklich" },
      author: "Edith Maria Soremba",
      published: "2020-01-01",
      contents: {
        de: "<p>In dem vorliegenden Buch schildert die Autorin den Krankeitsverlauf der ALS (Amyotrophe Lateralsklerose) bei ihrem Mann von den ersten Anzeichen über die Diagnose bis zu seinem Tod, der allerdings nicht unmittelbar durch seine Krankheit ausgelöst wurde. Der Text enthält konkrete Pflegetipps, die nicht nur ALS-Patienten und ihre Hauspflege betreffen, sondern auch anderen Patienten mit schwerwiegenden Erkrankungen und deren Angehörigen eine wertvolle Hilfe sein kann. Außer dem Aufzeigen von praktischen Hilfen, einem ausgewogenen Ernährungskonzept und hilfreichen Medikamenten zeigt die Verfasserin, dass Respekt vor dem Kranken, die Erhaltung seiner Würde, das Wecken seines eigenen Engagements im Umgang mit der Krankheit und natürlich große Zuneigung den Krankheitsverlauf positiv beeinflussen. Es fehlen natürlich auch nicht ausführliche Hinweise zur Patietenverfügung, zum Umgang mit Ämtern und Versicherungen, zum Anfertigen eines Pflegeprotokolls. Die Idee dieses Buches entstand bereits zu Lebzeiten des Ehemanns. Die Autorin betrat intuitiv neue Wege in der Pflege, die sie durch gezielte Lektüre vertiefte. Das Buch verfügt im Anhang daher auch über ein Literatur- und Adressverzeichnis, vor allem auch zahlreiche Internetadressen. Die behandelnden Ärzte zeigten sich positiv überrascht, wie durch die Pflege der bis dahin bei anderen Patienten rasche Fortgang der Krankheit aufgehalten werden konnte. Die Fachleute ermunterten die Autorin, ihre Aufzeichnungen zu veröffentlichen, anderen Betroffenen, aber auch dem Pflegepersonal und Ärzten eine wertvolle Hilfe zu geben. Doch das Buch ist noch mehr. Es ist auch eine ‚Mutspender-Lektüre’ für alle, die an die Kraft der Liebe glauben. Der Text ist daherangereichert mit sprechenden Bidern und persönlichen Einblicken in das Leben der Familie Soemba, das geprägt ist von einem großen Zusammenhalt und christlichen Wertvorstellungen. Edith-Maria Soremba ist Lehrerin im Ruhestand und qualifizierte Lern- und Legasthenietherapeutin, betreibt mit ihrem Sohn Michael eine Gemeinschaftspraxis für integrative Lerntheraphie. Als Autorin im Legasthenieberech hat sie sich bereits bundesweit einen Namen gemacht. Ihr Buch ‚Legasthenie muss kein Schicksal sein’ ist bereits in der 6.Auflage bei Herder-Spektrum erschienen. Frau Soremba ist zudem Mutter von sechs Kindern und lebt in Vechta.</p>",
      },
      coverImagePaths: ["19.1 Geschenkte Lebensjahre.png"],
      oldIds: [42],
    },
    {
      titles: { de: "Bis zum letzten Atemzug. Ein Plädoyer für menschenwürdiges Sterben" },
      author: "Christine Lehrke",
      published: "2020-01-01",
      contents: {
        de: "<p>Christine Lehrke und ihr Mann Klaus führen nach turbulenten Zeiten endlich eine harmonische, glückliche Beziehung, als sie plötzlich die furchtbare Diagnose aus dem Gleichgewicht bringt: Klaus hat ALS. Für Klaus gibt es nur einen Ausweg. Um nichts in der Welt will er sich diesem qualvollen Sterben aussetzen, sondern seinem Leben vorher ein Ende setzen. Dieses Buch beschreibt den schwierigen Weg zweier Menschen, die nur ein Ziel haben: menschenwürdig zu leben und zu sterben.</p>",
      },
      coverImagePaths: ["20.1 Bis zum letzten Atemzug.jpg", "20.2 Bis zum letzten Atemzug.png"],
      oldIds: [43],
    },
    {
      titles: { de: "Nur ein Funken Hoffnung" },
      author: "Ulla",
      published: "2020-01-01",
      contents: {
        de: "<p>Ulla erfährt mit ihren 41 Jahren, dass sie an ALS - einer seltenen Nervenkrankheit leidet, die sie von Monat zu Monat mehr in den Rollstuhl zwingt. Diese Krankheit ist unheilbar, die Ärzte können nur machtlos zusehen. Sie will nicht zum absoluten Pflegefall werden. Nicht einen einzigen Tag in ihrem Leben, wird sie ihre Krankheit akzeptieren und beschließt, außergewöhnliche Maßnahmen zu ergreifen. In Deutschland erfährt sie über Heilungsmöglichkeiten in einem fernen Land. Sie lässt alles stehen und liegen und fliegt, trotz ihrer Behinderung, für drei Monate nach Sri Lanka. Ihr Abenteuer beginnt.</p>",
      },
      coverImagePaths: ["21.1 Nur ein Funken Hoffnung.jpg"],
      oldIds: [44],
    },
    {
      titles: { de: "Rose & Gebrochen Deutsch" },
      author: "Christian Sighisorean",
      published: "2020-01-01",
      contents: {
        de: "<p>Der hier schreibt, schreibt um sein Leben. Und weiß doch, dass er es verlieren wird. Christian Sighisorean erfuhr 2006 von seiner Krankheit ALS, die binnen weniger Jahre zum Tode führt. Und schrieb dieses Gedicht: „Das Schönste an der Diagnose Amyotrophe Lateralsklerose kommt zum Schluss die Rose“. Ein Text am Abgrund und doch von großer Leichtigkeit und Gelassenheit. Diese Balance zwischen Todesnähe und Sprachfreude prägt viele Texte dieses Bandes, etwa „Den ersten Tag“, mit den Stationen des Leidensweges Vers für Vers. Oder die „Gen-Tauschbörse“, an der das SOR-Gen oder das ALS-Gen gegen das TRA-Gen oder das SE-Gen getauscht werden können. Spiel mit Sprache, Wörtern, Klängen. Texte in der Tradition von Ernst Jandl und Robert Gernhardt. Herzergreifend das Gedicht „Papa, warum“, Dialog zwischen dem Vater und seinen Kindern. Die Kinder stellen Fragen nach der für sie unerklärlich fortschreitenden Krankheit. Und geben immer neue Ratschläge: „Aber Papa, ... ich zeige es Dir, erst mit dem einen Fuß ... dann mit dem andern, das ist doch babyig“. Der Themenkreis „Gebrochen Deutsch“ umfasst politische Gedichte. Sighisorean, der Deutsche aus Rumänien, provoziert mit bissigem Sprachwitz und stellt unerbittliche Fragen, ungemütlich, aber höchst anregend. Dies ist sein erster Gedichtband. Ein außerordentliches Ereignis!</p>",
      },
      coverImagePaths: ["22.1 Rose und Gebrochen Deutsch.jpg"],
      oldIds: [45],
    },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
	];

	for (const book of booksData) {
		const firstCoverPath = book.coverImagePaths && book.coverImagePaths.length > 0 ? book.coverImagePaths[0] : null;

<<<<<<< HEAD
		// Dynamically build the translations object to avoid 'undefined' properties
=======
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		const bookTitleTranslations: { [lang: string]: string } = {};
		if (book.titles.de) bookTitleTranslations.de = book.titles.de;
		if (book.titles.it) bookTitleTranslations.it = book.titles.it;

		const bookContentTranslations: { [lang: string]: string } = {};
		if (book.contents.de) bookContentTranslations.de = book.contents.de;
		if (book.contents.it) bookContentTranslations.it = book.contents.it;

		await prisma.book.create({
			data: {
				titleRawTranslationId: await createRawTranslationWithData(bookTitleTranslations),
				author: book.author,
				published: new Date(book.published),
				contentRawTranslationId: await createRawTranslationWithData(bookContentTranslations),
<<<<<<< HEAD
				coverImageId: await createMediaItemEntry(firstCoverPath, defaultUploaderId),
				links: [],
			}
		});
	}
	console.log('Created Books');

=======
        coverImageId: await createMediaItemEntry(firstCoverPath, defaultUploaderId), // Uses storageKey
        links: [],
      },
    });
  }
  console.log("Created Books");

  // --- 8. Blogs (from old Post) ---
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
	const blogsData = [
		{
			slug: "what-is-als",
			titles: { en: "What is ALS?", de: "Was ist ALS?", it: "Cos è la SLA?" },
			contents: {
				en: "ALS is a chronic degenerative disease affecting the motor nervous system, responsible for muscle movement. It causes progressive muscle weakness, leading to paralysis.",
				de: "ALS ist eine chronisch-degenerative Erkrankung des motorischen Nervensystems, das für die Bewegung der Muskeln verantwortlich ist. Die Krankheit führt zu fortschreitender Muskelschwäche bis hin zur Lähmung.",
<<<<<<< HEAD
				it: "La SLA è una malattia neurodegenerativa cronica che colpisce il sistema nervoso motorio, responsabile del movimento muscolare. Provoca una debolezza muscolare progressiva fino alla paralisi."
=======
        it: "La SLA è una malattia neurodegenerativa cronica che colpisce il sistema nervoso motorio, responsabile del movimento muscolare. Provoca una debolezza muscolare progressiva fino alla paralisi.",
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			},
			publishedAt: "2025-02-16 19:38:04.86",
			updatedAt: "2025-02-16 19:38:04.86",
			coverImagePath: null,
		},
		{
			slug: "symptoms-diagnosis-als",
<<<<<<< HEAD
			titles: { en: "Symptoms and Diagnosis of ALS", de: "Symptome und Diagnose von ALS", it: "Sintomi e diagnosi della SLA" },
			contents: {
				en: "Early signs include muscle weakness, trouble swallowing, slurred speech, and progressive paralysis. Diagnosis is done by exclusion and neurological examinations.",
				de: "Erste Anzeichen sind Muskelschwäche, Schluckbeschwerden, undeutliche Sprache und fortschreitende Lähmung. Die Diagnose erfolgt durch Ausschlussprinzip und neurologische Untersuchungen.",
				it: "I primi segni includono debolezza muscolare, difficoltà a deglutire, linguaggio confuso und paralisi progressiva. La diagnosi avviene per esclusione e esami neurologici."
=======
      titles: {
        en: "Symptoms and Diagnosis of ALS",
        de: "Symptome und Diagnose von ALS",
        it: "Sintomi e diagnosi della SLA",
      },
      contents: {
        en: "Early signs include muscle weakness, trouble swallowing, slurred speech, and progressive paralysis. Diagnosis is done by exclusion and neurological examinations.",
        de: "Erste Anzeichen sind Muskelschwäche, Schluckbeschwerden, undeutliche Sprache und fortschreitende Lähmung. Die Diagnose erfolgt durch Ausschlussprinzip und neurologische Untersuchungen.",
        it: "I primi segni includono debolezza muscolare, difficoltà a deglutire, linguaggio confuso e paralisi progressiva. La diagnosi avviene per esclusione e esami neurologici.",
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			},
			publishedAt: "2025-02-16 19:38:04.86",
			updatedAt: "2025-02-16 19:38:04.86",
			coverImagePath: null,
		},
		{
			slug: "scientific-research-als",
<<<<<<< HEAD
			titles: { en: "Scientific Research on ALS", de: "Wissenschaftliche Forschung zu ALS", it: "Ricerca scientifica sulla SLA" },
			contents: {
				en: "Current studies focus on genetic factors, environmental triggers, and neurobiological processes leading to ALS. There is also research on the role of microbiomes in ALS progression.",
				de: "Aktuelle Studien konzentrieren sich auf genetische Faktoren, Umweltfaktoren und neurobiologische Prozesse, die zur ALS führen. Zudem wird die Rolle des Mikrobioms erforscht.",
				it: "Gli studi attuali si concentrano sui fattori genetici, i fattori ambientali e i processi neurobiologici alla base della SLA. Viene studiato anche il ruolo del microbioma."
=======
      titles: {
        en: "Scientific Research on ALS",
        de: "Wissenschaftliche Forschung zu ALS",
        it: "Ricerca scientifica sulla SLA",
      },
      contents: {
        en: "Current studies focus on genetic factors, environmental triggers, and neurobiological processes leading to ALS. There is also research on the role of microbiomes in ALS progression.",
        de: "Aktuelle Studien konzentrieren sich auf genetische Faktoren, Umweltfaktoren und neurobiologische Prozesse, die zur ALS führen. Zudem wird die Rolle des Mikrobioms erforscht.",
        it: "Gli studi attuali si concentrano sui fattori genetici, i fattori ambientali e i processi neurobiologici alla base della SLA. Viene studiato anche il ruolo del microbioma.",
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			},
			publishedAt: "2025-02-16 19:38:04.86",
			updatedAt: "2025-02-16 19:38:04.86",
			coverImagePath: null,
		},
		{
			slug: "als-ecke",
			titles: { de: "Die ALS-Ecke" },
<<<<<<< HEAD
			contents: { de: "Die ALS-Ecke ist ein speziell eingerichteter Bereich, in dem Betroffene und Angehörige Informationen, Unterstützung und Austauschmöglichkeiten finden. Hier gibt es hilfreiche Materialien und Kontakte zu Experten." },
=======
      contents: {
        de: "Die ALS-Ecke ist ein speziell eingerichteter Bereich, in dem Betroffene und Angehörige Informationen, Unterstützung und Austauschmöglichkeiten finden. Hier gibt es hilfreiche Materialien und Kontakte zu Experten.",
      },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			publishedAt: "2025-02-16 20:22:51.768",
			updatedAt: "2025-02-16 20:22:51.768",
			coverImagePath: "/placeholder.webp",
		},
		{
			slug: "als-koffer",
			titles: { de: "Der ALS-Koffer" },
<<<<<<< HEAD
			contents: { de: "Der ALS-Koffer besteht aus Medien, die von Einzelpersonen, vor allem aber Organisationen ausgeliehen werden können. Er dient dazu, die Erkrankung ALS zu thematisieren." },
=======
      contents: {
        de: "Der ALS-Koffer besteht aus Medien, die von Einzelpersonen, vor allem aber Organisationen ausgeliehen werden können. Er dient dazu, die Erkrankung ALS zu thematisieren.",
      },
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
			publishedAt: "2025-02-16 20:24:01.074",
			updatedAt: "2025-02-16 20:24:01.074",
			coverImagePath: "/placeholder.webp",
		},
	];

	for (const blog of blogsData) {
<<<<<<< HEAD
		// Dynamically build the translations object for blog titles
=======
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		const blogTitleTranslations: { [lang: string]: string } = {};
		if (blog.titles.de) blogTitleTranslations.de = blog.titles.de;
		if (blog.titles.en) blogTitleTranslations.en = blog.titles.en;
		if (blog.titles.it) blogTitleTranslations.it = blog.titles.it;

<<<<<<< HEAD
		// Dynamically build the translations object for blog contents
=======
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
		const blogContentTranslations: { [lang: string]: string } = {};
		if (blog.contents.de) blogContentTranslations.de = blog.contents.de;
		if (blog.contents.en) blogContentTranslations.en = blog.contents.en;
		if (blog.contents.it) blogContentTranslations.it = blog.contents.it;

		await prisma.blog.upsert({
			where: { slug: blog.slug },
			update: {
				titleRawTranslationId: await createRawTranslationWithData(blogTitleTranslations),
				authors: [defaultAuthorName],
				contentRawTranslationId: await createRawTranslationWithData(blogContentTranslations),
<<<<<<< HEAD
				coverImageId: await createMediaItemEntry(blog.coverImagePath, defaultUploaderId),
=======
        coverImageId: await createMediaItemEntry(blog.coverImagePath, defaultUploaderId), // Uses storageKey
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
				publishedAt: new Date(blog.publishedAt),
			},
			create: {
				slug: blog.slug,
				titleRawTranslationId: await createRawTranslationWithData(blogTitleTranslations),
				authors: [defaultAuthorName],
				contentRawTranslationId: await createRawTranslationWithData(blogContentTranslations),
<<<<<<< HEAD
				coverImageId: await createMediaItemEntry(blog.coverImagePath, defaultUploaderId),
				publishedAt: new Date(blog.publishedAt),
				updatedAt: new Date(blog.updatedAt),
			}
		});
	}
	console.log('Created/Upserted Blogs');

	console.log('Hardcoded data migration finished.');
=======
        coverImageId: await createMediaItemEntry(blog.coverImagePath, defaultUploaderId), // Uses storageKey
        publishedAt: new Date(blog.publishedAt),
        updatedAt: new Date(blog.updatedAt),
      },
    });
  }
  console.log("Created/Upserted Blogs");

  console.log("Hardcoded data migration finished.");
>>>>>>> 6764d90ebf968dcada002db65007b042929843e4
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
