import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { bunApiFetch } from "@/lib/auth/bunApi";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/** Same pattern as signup: forward to bun/api, set the httpOnly cookie, strip the token from the response. */
export async function POST(request: Request) {
  const body = await request.text();
  const backendRes = await bunApiFetch("/auth/signin", { method: "POST", body });
  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ user: data.user }, { status: backendRes.status });
}
