import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * bun/api has no logout/blacklist endpoint - JWTs are stateless and "logout"
 * is purely client-side discard, so this just clears the cookie.
 */
export async function POST() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
