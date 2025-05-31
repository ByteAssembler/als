import { defineMiddleware } from "astro/middleware";

import jwt from "jsonwebtoken";
import { allLanguages } from "./components/navigation/navbar-content";

export const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export const onRequest = defineMiddleware((context, next) => {
	context.locals.lang = "en";

	// Skip middleware for static files and special paths
	if (
		context.url.pathname.startsWith("/api") ||
		context.url.pathname.startsWith("/static") ||
		context.url.pathname.startsWith("/assets") ||
		context.url.pathname.startsWith("/favicon.ico") ||
		context.url.pathname.startsWith("/robots.txt") ||
		context.url.pathname.includes("trpc")
	) {
		return next();
	}

	// 1. Set lang for all pages (including admin pages)
	const segments = context.url.pathname.split("/").filter(Boolean);
	if (segments.length > 0) {
		const langCode = segments[0];
		if (langCode.length <= 3) {
			if (allLanguages.includes(langCode)) {
				context.locals.lang = langCode;
			} else {
				return new Response(null, {
					status: 302,
					headers: { Location: "/en" },
				});
			}
		}
	}

	// 2. Admin authentication - only for admin pages
	if (!context.url.pathname.startsWith("/admin") || context.url.pathname.startsWith("/admin/login")) {
		return next();
	}

	const token = context.cookies.get("token")?.value;

	if (!token) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/admin/login" },
		});
	}

	try {
		const decoded = jwt.verify(token, SECRET_KEY) as { role: string };

		if (decoded.role !== "SUPERADMIN") {
			return new Response(null, {
				status: 302,
				headers: { Location: "/admin/login" },
			});
		}

		return next(); // Zugriff erlaubt
	} catch (error) {
		return new Response(null, {
			status: 302,
			headers: { Location: "/admin/login" },
		});
	}
});
