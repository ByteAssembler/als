import db from "../../utils/db";

export async function GET() {
	const navbarItems = await db.navbar.findMany();
	return new Response(JSON.stringify(navbarItems), { status: 200 });
}

export async function POST({ request }: { request: Request }) {
	const { language, text, href, onLanguageSlug } = await request.json();

	const newItem = await db.navbar.create({
		data: { language, text, href, onLanguageSlug },
	});

	return new Response(JSON.stringify(newItem), { status: 201 });
}

export async function PUT({ request }: { request: Request }) {
	const { id, language, text, href, onLanguageSlug } = await request.json();

	const updatedItem = await db.navbar.update({
		where: { id },
		data: { language, text, href, onLanguageSlug },
	});

	return new Response(JSON.stringify(updatedItem), { status: 200 });
}

export async function DELETE({ request }: { request: Request }) {
	const { id } = await request.json();

	await db.navbar.delete({ where: { id } });

	return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
