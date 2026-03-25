import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    LITELLM_API_KEY: process.env.LITELLM_API_KEY ? "set (" + process.env.LITELLM_API_KEY.slice(0, 5) + "...)" : "MISSING",
    LITELLM_BASE_URL: process.env.LITELLM_BASE_URL || "MISSING",
    LITELLM_MODEL: process.env.LITELLM_MODEL || "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set (" + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 5) + "...)" : "MISSING",
  };

  // Test LiteLLM connectivity
  let llmReachable = "not tested";
  if (process.env.LITELLM_BASE_URL) {
    try {
      const res = await fetch(`${process.env.LITELLM_BASE_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      llmReachable = `${res.status} ${res.statusText}`;
    } catch (err: any) {
      llmReachable = `error: ${err.message}`;
    }
  }

  return NextResponse.json({ checks, llmReachable });
}
