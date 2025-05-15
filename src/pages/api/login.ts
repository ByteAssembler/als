import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../utils/db";

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

export async function POST({ request }: { request: Request }) {
	console.log("ROST REQUEST");
	const { username, password } = await request.json();
	const admin = await db.admin.findUnique({ where: { username } });

	console.log(admin);
	if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
		return new Response(JSON.stringify({ error: "Invalid credentials" }), {
			status: 401,
		});
	}

	const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, SECRET_KEY, { expiresIn: "2h" });

	const response = new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });

	response.headers.append("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=7200; Secure; SameSite=Strict`);

	return response;
}
