import type { AppRouter, AuthRouter } from "./handlers";
import superjson from "superjson";

export type TrpcResponse<T> =
	| { error: null; data: T }
	| { error: string; data: null };

export function createSuccessResponse<T>(data: T): TrpcResponse<T> {
	return { error: null, data };
}

export function createErrorResponse<T = never>(error: string): TrpcResponse<T> {
	return { error, data: null };
}

export async function makeResponse<T>(data: T) {
	return new Response(superjson.stringify(createSuccessResponse(data)), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

export type inferInput<RouteKey extends keyof AppRouter> =
	Parameters<AppRouter[RouteKey]>;
export type inferOutput<RouteKey extends keyof AppRouter> =
	Awaited<ReturnType<AppRouter[RouteKey]>>;

export type inferAuthInput<RouteKey extends keyof AuthRouter> =
	Parameters<AuthRouter[RouteKey]>;
export type inferAuthOutput<RouteKey extends keyof AuthRouter> =
	Awaited<ReturnType<AuthRouter[RouteKey]>>;

export async function trpcQuery<K extends keyof AppRouter>(
	route: K,
	...input: inferInput<K>
): Promise<inferOutput<K>> {
	const res = await fetch("/api/trpc", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: superjson.stringify({ destination: route, data: input }),
	});

	if (!res.ok) throw new Error(`Error ${res.status}`);

	const textResponse = await res.text();
	const wrappedResponse: TrpcResponse<inferOutput<K>> = superjson.parse(textResponse);

	if (wrappedResponse.error) {
		throw new Error(wrappedResponse.error);
	}

	// TypeScript can't infer that data is not null after error check, so we assert it
	return wrappedResponse.data as inferOutput<K>;
}

export async function trpcAuthQuery<K extends keyof AuthRouter>(
	route: K,
	authToken: string,
	...input: inferAuthInput<K>
): Promise<inferAuthOutput<K>> {
	const res = await fetch("/api/trpc/auth", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${authToken}`
		},
		body: superjson.stringify({ destination: route, data: input }),
	});

	if (!res.ok) throw new Error(`Error ${res.status}`);

	const textResponse = await res.text();
	const wrappedResponse: TrpcResponse<inferAuthOutput<K>> = superjson.parse(textResponse);

	if (wrappedResponse.error) {
		throw new Error(wrappedResponse.error);
	}

	return wrappedResponse.data as inferAuthOutput<K>;
}
