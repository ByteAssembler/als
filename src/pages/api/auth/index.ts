import type { APIRoute } from "astro";

// Sign a jwt token thats valid for 3 days
import { sign } from "jsonwebtoken";

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    // Process the form data here
    console.log("Received form data:", { username, password });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Form data received successfully",
        data: { username, password },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error processing form data",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
