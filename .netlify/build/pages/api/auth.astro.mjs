import 'jsonwebtoken';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");
    console.log("Received form data:", { username, password });
    return new Response(JSON.stringify({
      success: true,
      message: "Form data received successfully",
      data: { username, password }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: "Error processing form data"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
