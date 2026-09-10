import { NextResponse, type NextRequest } from "next/server";
import { getSessionToken } from "@/lib/auth/session";
import { bunApiFetch } from "@/lib/auth/bunApi";

/**
 * Generic reverse proxy for every resource route (organizations, campaigns,
 * templates, ...). A single catch-all avoids duplicating forwarding logic
 * across 9+ resource-specific handlers - only /api/auth/* gets dedicated
 * files, since those uniquely need to set/clear the session cookie.
 */
type Params = { path: string[] };

async function forward(request: NextRequest, { params }: { params: Promise<Params> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { path } = await params;
  const search = request.nextUrl.search;
  const hasBody = request.method !== "GET" && request.method !== "DELETE" && request.method !== "HEAD";

  const backendRes = await bunApiFetch(`/${path.join("/")}${search}`, {
    method: request.method,
    headers: { Authorization: `Bearer ${token}` },
    body: hasBody ? await request.text() : undefined,
  });

  // 204/empty bodies (e.g. some DELETE responses) can't be parsed as JSON.
  const text = await backendRes.text();
  if (!text) {
    return new NextResponse(null, { status: backendRes.status });
  }
  return new NextResponse(text, {
    status: backendRes.status,
    headers: { "Content-Type": "application/json" },
  });
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
