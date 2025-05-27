import SuperJSON from "superjson";
import { publicHandlers, authHandlers } from "./handlers";
import type { AppRouter, AuthRouter } from "./handlers";

// Define CombinedRouter by merging AppRouter and AuthRouter types
type CombinedRouter = AppRouter & AuthRouter;

// Type allHandlers with CombinedRouter for precise type information
const allHandlers: CombinedRouter = {
	...publicHandlers,
	...authHandlers, // privateHandlers are exported as authHandlers
};

// Make CacheEntry generic to store typed data
interface CacheEntry<T = any> {
	data: T;
	timestamp: number;
}

const cache = new Map<string, CacheEntry>(); // Cache will store CacheEntry<any> by default
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetches data using a handler ID, utilizing an in-memory cache with strong type safety.
 * This function is intended for server-side use only.
 *
 * @param handlerId The ID of the handler to execute (e.g., "public.test" or "user.list").
 *   Must be a key of CombinedRouter.
 * @param params The parameters to pass to the handler. Must match the handler's signature.
 * @returns A Promise resolving to the handler's result, with the correct type.
 */
export async function fetchDataFromServer<K extends keyof CombinedRouter>(
	handlerId: K,
	...params: Parameters<CombinedRouter[K]>
): Promise<Awaited<ReturnType<CombinedRouter[K]>>> {
	const cacheKey = `${String(handlerId)}:${SuperJSON.stringify(params)}`;

	// Retrieve from cache with specific type assertion
	const cachedEntry = cache.get(cacheKey) as CacheEntry<Awaited<ReturnType<CombinedRouter[K]>>> | undefined;

	if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS)) {
		// Cache hit and entry is not expired
		console.log(`[Cache Hit] Returning cached data for handler: ${String(handlerId)}`);
		return cachedEntry.data;
	}

	// Cache miss or entry expired
	const handler: CombinedRouter[K] = allHandlers[handlerId];

	if (typeof handler !== 'function') {
		console.error(`[Server Helper] Critical: Handler with id "${String(handlerId)}" is not a function or not found.`);
		throw new Error(`Critical: Handler with id "${String(handlerId)}" is not a function or not found.`);
	}

	console.log(`[Cache Miss] Fetching data for handler: ${String(handlerId)}`);
	try {
		// The handler is CombinedRouter[K] (a union of function types if K is generic here).
		// params is Parameters<CombinedRouter[K]> (a union of tuple types).
		// TypeScript struggles to verify this call directly without assertion.
		// We use 'as any' on the handler for the call, relying on the function's
		// generic constraints (K) to ensure overall type safety.
		// The result of `(handler as any)(...params)` will be `any`.
		const resultFromHandlerCall: any = await (handler as any)(...params);

		// We then explicitly cast the 'any' result to the known specific return type.
		const result: Awaited<ReturnType<CombinedRouter[K]>> = resultFromHandlerCall;

		// Store the specifically typed result in the cache
		// CacheEntry.data is 'any', so this assignment is fine.
		cache.set(cacheKey, { data: result, timestamp: Date.now() });
		return result;
	} catch (error) {
		console.error(`[Server Helper] Error executing handler "${String(handlerId)}":`, error);
		throw error; // Re-throw the error to be handled by the caller
	}
}

// Example usage (for testing purposes, not part of the actual helper):
/*
async function testServerHelpers() {
	try {
		console.log("Fetching public.test (1st time):");
		// Type-safe call: no params expected, returns Promise<string>
		const publicTestResult1: string = await fetchDataFromServer("public.test");
		console.log("Result 1:", publicTestResult1);

		console.log("\nFetching public.test (2nd time - should be cached):");
		const publicTestResult2 = await fetchDataFromServer("public.test");
		console.log("Result 2:", publicTestResult2);

		// Example for a private handler that returns void
		// Assuming "private.test" is async () => Promise<void>
		console.log("\nFetching private.test:");
		await fetchDataFromServer("private.test"); // Correctly typed as Promise<void>
		console.log("private.test called");


		// Example for a handler with parameters
		// Assuming "blog.create" is async (input: BlogCreateInput) => Promise<Blog>
		// type BlogCreateInput = { title: string; content: string; authors: string[]; coverImage?: string | null; contentRawTranslationId: number; titleRawTranslationId: number; slug: string; };
		// type Blog = { id: number; publishedAt: Date; updatedAt: Date; } & BlogCreateInput;

		// const blogInput: BlogCreateInput = {
		//     title: "New Post from Helper",
		//     content: "Content here",
		//     authors: ["author1"],
		//     slug: "new-post-helper",
		//     titleRawTranslationId: 1,
		//     contentRawTranslationId: 2,
		// };
		// const newBlog: Blog = await fetchDataFromServer("blog.create", blogInput);
		// console.log("\nCreated new blog:", newBlog);


		// This would cause a type error if "public.test" doesn't accept arguments:
		// await fetchDataFromServer("public.test", "someArg");

		// This would cause a type error if "nonExistent.handler" is not a valid key:
		// await fetchDataFromServer("nonExistent.handler");

	} catch (e) {
		console.error("Error in testServerHelpers:", e);
	}
}

// testServerHelpers();
*/
