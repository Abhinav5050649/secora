import { NextResponse } from "next/server";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { bunApiFetch } from "@/lib/auth/bunApi";

/**
 * Backs the org switcher and role-gating: GET /users/:id/organizations
 * returns every org the current user belongs to plus their role in each.
 */
export async function GET() {
  const [session, token] = await Promise.all([getSession(), getSessionToken()]);
  if (!session || !token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const backendRes = await bunApiFetch(`/users/${session.sub}/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
