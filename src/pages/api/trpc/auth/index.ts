import type { APIRoute } from "astro";
import { authHandlers } from "../handlers";
import superjson from "superjson";
import { createSuccessResponse, createErrorResponse } from "../trpc";

import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/middleware";

export const prerender = false;

// Simple auth check - replace with your actual authentication logic
function isAuthenticated(request: Request): boolean {
	let authHeader = request.headers.get("Authorization");
	if (!authHeader) {
		const cookieHeader = request.headers.get("Cookie");
		if (cookieHeader) {
			const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));
			authHeader = cookies["token"];

			// Decode the token
			const decodedToken = authHeader?.startsWith("Bearer ")
				? authHeader.slice(7) // Remove "Bearer " prefix
				: authHeader;

			if (!decodedToken) {
				return false; // No token found
			}

			const decoded = jwt.verify(decodedToken, SECRET_KEY);
			console.log("Decoded token:", decoded);
			//! TODO: Implement your actual token validation logic here
			return true; // Token is valid
		}
	}
	if (!authHeader) {
		return false; // No auth header or cookie found
	}
	console.log("Auth header:", authHeader);
	// TODO: Implement your actual authentication logic here
	// For example: JWT validation, session check, API key validation, etc.
	return authHeader?.startsWith("Bearer ") || false;
}

export const POST: APIRoute = async ({ request }) => {
	// Check authentication first
	if (!isAuthenticated(request)) {
		return new Response(superjson.stringify(createErrorResponse("Unauthorized")), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

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
	const handler = (authHandlers as Record<string, Function>)[destination] as
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
