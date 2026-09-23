import { NextResponse } from "next/server";
import { createSessionToken, passwordsMatch, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") || "");

  let valid = false;
  try {
    valid = passwordsMatch(password);
  } catch (error) {
    console.error("Team authentication is not configured", error);
    return new NextResponse("Team access is not configured.", { status: 503 });
  }

  if (!valid) return NextResponse.redirect(new URL("/team/login?error=1", request.url), 303);

  const response = NextResponse.redirect(new URL("/team", request.url), 303);
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}
