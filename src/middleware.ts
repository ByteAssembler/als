import { defineMiddleware } from "astro/middleware";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export const onRequest = defineMiddleware((context, next) => {
	// Middleware nur für Admin-Seiten aktivieren
	if (!context.url.pathname.startsWith("/admin")) {
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
