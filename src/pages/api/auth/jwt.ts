import * as jwt from "jsonwebtoken";

const JWT_SECRET = import.meta.env.JWT_SECRET || `${crypto.randomUUID()}-${crypto.randomUUID()}`;

// Create a token that is valid for 3 h
function createToken(payload: any) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "3h" });
}

// Verify the token
function isTokenValid(token: string): boolean {
	try {
		jwt.verify(token, JWT_SECRET);
		return true;
	} catch (e) {
		return false;
	}
}
