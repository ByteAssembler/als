import { defineMiddleware } from "astro/middleware";

import jwt from "jsonwebtoken";

export const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export const onRequest = defineMiddleware((context, next) => {
	// 1. Set lang
	const segments = context.url.pathname.split("/").filter(Boolean);
	if (segments.length > 0) {
		const langCode = segments[0];
		context.locals.lang = langCode;
	}

	// Middleware nur für Admin-Seiten aktivieren
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
