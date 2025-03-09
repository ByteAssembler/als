export async function POST() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers,
  });
}
