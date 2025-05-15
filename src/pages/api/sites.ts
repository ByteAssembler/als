// src/pages/api/sites.ts
import { PrismaClient } from "@prisma/client";
import type { APIRoute } from "astro";
import db from "../../utils/db";

export const GET: APIRoute = async () => {
	try {
		const sites = await db.site.findMany();
		return new Response(JSON.stringify(sites), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: "Failed to fetch sites: " + error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
