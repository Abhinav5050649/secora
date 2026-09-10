import { useParams } from "next/navigation";
import { useGetMyOrganizationsQuery } from "@/features/session";
import type { OrganizationUserRole } from "@/types/resources";

/**
 * Mirrors bun/api's own `ROLE_RANK` (`src/middleware/authorize.ts`) so UI
 * gating stays consistent with what the backend will actually allow.
 * Exported so other UI (e.g. the members page's role dropdown) can compare
 * ranks without hand-rolling its own copy of this hierarchy.
 */
export const ROLE_RANK: Record<OrganizationUserRole, number> = { viewer: 1, editor: 2, admin: 3, owner: 4 };

export interface CurrentOrgRole {
  role: OrganizationUserRole | null;
  isViewer: boolean;
  isEditor: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isLoading: boolean;
  /** True once membership data has loaded and the current org id has no matching membership. */
  isNotMember: boolean;
  atLeast: (min: OrganizationUserRole) => boolean;
}

/**
 * Reads `orgId` from the route params and looks up the caller's role for
 * that org from the cached `getMyOrganizations` result.
 */
export function useCurrentOrgRole(): CurrentOrgRole {
  const params = useParams<{ orgId?: string }>();
  const orgId = params?.orgId;
  const { data, isLoading, isSuccess } = useGetMyOrganizationsQuery();

  const membership = data?.find((org) => org.organization_id === orgId);
  const role = membership?.role ?? null;

  return {
    role,
    isViewer: role !== null,
    isEditor: role === "editor" || role === "admin" || role === "owner",
    isAdmin: role === "admin" || role === "owner",
    isOwner: role === "owner",
    isLoading,
    isNotMember: isSuccess && !!orgId && !membership,
    atLeast: (min) => (role ? ROLE_RANK[role] >= ROLE_RANK[min] : false),
  };
}
