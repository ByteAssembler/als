// seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	// Lösche vorhandene Daten (optional)
	await prisma.mapPoint.deleteMany();
	await prisma.mapPointType.deleteMany();

	// Füge MapPointTypes hinzu
	const hauptsitzType = await prisma.mapPointType.create({
		data: {
			name: "Hauptsitz",
			description: "Hauptsitz der Organisation",
		},
	});

	const krankenhausType = await prisma.mapPointType.create({
		data: {
			name: "Krankenhäuser",
			description: "Krankenhäuser mit ALS-Spezialisierung",
		},
	});

	const unterstutzungType = await prisma.mapPointType.create({
		data: {
			name: "Unterstützungsgruppen",
			description: "Selbsthilfegruppen für ALS-Patienten",
		},
	});

	const forschungType = await prisma.mapPointType.create({
		data: {
			name: "Forschungszentren",
			description: "Forschungseinrichtungen für ALS",
		},
	});

	// Füge MapPoints hinzu
	await prisma.mapPoint.createMany({
		data: [
			// Hauptsitz
			{
				name: "Olang",
				description: "Hauptsitz der Organisation",
				typeId: hauptsitzType.id,
				latitude: 46.7419,
				longitude: 12.0196,
			},

			// Krankenhäuser
			{
				name: "Zentrum ALS Ulm",
				description: "Spezialklinik für ALS-Patienten",
				typeId: krankenhausType.id,
				latitude: 48.402,
				longitude: 10.0014,
			},
			{
				name: "Charité Berlin",
				description: "Universitätsmedizin mit ALS-Forschung",
				typeId: krankenhausType.id,
				latitude: 52.5268,
				longitude: 13.3766,
			},

			// Unterstützungsgruppen
			{
				name: "Selbsthilfegruppe München",
				description: "Monatliche Treffen für Betroffene",
				typeId: unterstutzungType.id,
				latitude: 48.1351,
				longitude: 11.582,
			},

			// Forschungszentren
			{
				name: "ALS Research Institute",
				description: "Führend in ALS-Studien",
				typeId: forschungType.id,
				latitude: 52.52,
				longitude: 13.405,
			},
		],
	});
}

// Beispiel für weitere Daten
await prisma.mapPointType.create({
	data: {
		name: "Reha-Zentren",
		description: "Rehabilitation für ALS-Patienten",
	},
});

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
