import { NextResponse } from "next/server";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { bunApiFetch } from "@/lib/auth/bunApi";

/** Resolves the current user from the session cookie by calling GET /users/:id on bun/api. */
export async function GET() {
  const [session, token] = await Promise.all([getSession(), getSessionToken()]);
  if (!session || !token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const backendRes = await bunApiFetch(`/users/${session.sub}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
