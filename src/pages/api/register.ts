import bcrypt from "bcrypt";
import db from "../../utils/db";

export async function POST({ request }: { request: Request }) {
    const { username, password } = await request.json();

    // Prüfen, ob bereits ein Admin existiert
    const adminCount = await db.admin.count();

    // Passwort hashen
    const passwordHash = await bcrypt.hash(password, 10);

    // Erste Registrierung = SUPER_ADMIN, sonst EDITOR
    const role = adminCount === 0 ? "SUPERADMIN" : "EDITOR";
    const acceptedBySuperAdmin = adminCount === 0 ? true : false;

    // Neuen Admin erstellen
    const newAdmin = await db.admin.create({
        data: {
            username,
            passwordHash,
            role,
            acceptedBySuperAdmin,
        },
    });

    return new Response(
        JSON.stringify({ message: "Admin registered", admin: newAdmin }),
        { status: 201 }
    );
}
