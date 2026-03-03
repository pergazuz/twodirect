import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error_param = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? "/";

  // Handle OAuth errors
  if (error_param) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error_param)}`, request.url)
    );
  }

  if (code) {
    const redirectUrl = new URL(next, request.url);
    const responseCookies: { name: string; value: string; options: any }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => {
              responseCookies.push(cookie);
            });
          },
        },
      }
    );

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
        );
      }

      if (data?.session) {
        const response = NextResponse.redirect(redirectUrl);

        responseCookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            path: options?.path ?? "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: options?.sameSite ?? "lax",
          });
        });

        return response;
      }

      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("No session returned")}`, request.url)
      );
    } catch {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Unexpected authentication error")}`, request.url)
      );
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}

