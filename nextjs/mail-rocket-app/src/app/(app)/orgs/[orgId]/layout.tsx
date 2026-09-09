import { redirect } from "next/navigation";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { bunApiFetch } from "@/lib/auth/bunApi";
import type { UserOrganization } from "@/types/resources";

/**
 * Server-side membership check: reads the httpOnly cookie directly and
 * calls bun/api server-to-server (no CORS concern - it's server-to-server),
 * so a non-member never even sees the org shell flash before redirecting.
 * Client components underneath still use RTK Query's cached
 * `getMyOrganizations` for the same data going forward.
 */
export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const [session, token] = await Promise.all([getSession(), getSessionToken()]);
  if (!session || !token) redirect("/login");

  const res = await bunApiFetch(`/users/${session.sub}/organizations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) redirect("/orgs");

  const memberships = (await res.json()) as UserOrganization[];
  const isMember = memberships.some((m) => m.organization_id === orgId);
  if (!isMember) redirect("/orgs");

  return children;
}
