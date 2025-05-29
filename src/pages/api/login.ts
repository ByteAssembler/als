import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../utils/db";
import { loginUserSchema } from "./trpc/handlers/user";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export async function POST({ request }: { request: Request }) {
	const jsonData = await request.json();

	const validation = loginUserSchema.safeParse(jsonData);
	if (!validation.success) {
		return new Response(JSON.stringify({ error: "Invalid input or credentials" }), {
			status: 400,
		});
	}

	const admin = await db.user.findUnique({ where: { email: validation.data.email } });

	console.log(admin);
	if (!admin || !(await bcrypt.compare(validation.data.password, admin.passwordHash))) {
		return new Response(JSON.stringify({ error: "Invalid input or credentials" }), {
			status: 400,
		});
	}

	const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, SECRET_KEY, { expiresIn: "2h" });

	const response = new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });

	response.headers.append("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=7200; Secure; SameSite=Strict`);

	return response;
}
