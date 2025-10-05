import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * API route to generate ephemeral client tokens for OpenAI Realtime API
 * These tokens are short-lived and safe to use in the browser
 */
export async function GET() {
  try {
    await auth.protect();

    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: "gpt-4o-mini-realtime-preview",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    // Return the complete session data
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/openai/token] error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Also support POST for compatibility
export async function POST() {
  return GET();
}
