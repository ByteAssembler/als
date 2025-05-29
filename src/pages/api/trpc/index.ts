import type { APIRoute } from "astro";
import superjson from "superjson";
import { createSuccessResponse, createErrorResponse } from "./trpc";
import { publicHandlers } from "./handlers";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	let reqBody: any;
	try {
		const textBody = await request.text();
		reqBody = superjson.parse(textBody);

		if (!("destination" in reqBody)) {
			throw new Error();
		}

		if (!("data" in reqBody)) {
			reqBody.data = undefined;
		}

		if (typeof reqBody.destination !== "string") {
			throw new Error();
		}

	} catch {
		return new Response(superjson.stringify(createErrorResponse("Invalid request")), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { destination, data } = reqBody;
	const handler = (publicHandlers as Record<string, Function>)[destination] as
		| ((...args: any[]) => Promise<any>)
		| undefined;
	if (!handler) {
		return new Response(superjson.stringify(createErrorResponse("Unknown destination")), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const args = Array.isArray(data)
			? data
			: data === undefined
				? []
				: [data];
		const result = await handler(...args);

		return new Response(superjson.stringify(createSuccessResponse(result ?? {})), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error(err);
		return new Response(superjson.stringify(createErrorResponse("Internal server error")), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
