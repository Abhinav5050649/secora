"use client";

import * as React from "react";
import { useCurrentOrgRole } from "@/hooks/useCurrentOrgRole";
import type { OrganizationUserRole } from "@/types/resources";

interface RequireRoleProps {
  atLeast: OrganizationUserRole;
  mode?: "hide" | "disable";
  children: React.ReactElement;
}

/**
 * Gates a single control (button, menu item, ...) by the caller's role in
 * the current org. This is UX-only - the backend independently enforces the
 * same rank via `requireRole`, so a mutation can still come back 403 (e.g.
 * role changed in another tab) and must be handled gracefully regardless.
 */
export function RequireRole({ atLeast, mode = "hide", children }: RequireRoleProps) {
  const { atLeast: hasAtLeast, isLoading } = useCurrentOrgRole();
  const allowed = !isLoading && hasAtLeast(atLeast);

  if (allowed) return children;
  if (mode === "hide") return null;
  // Untitled UI's react-aria-based controls use `isDisabled`; plain native
  // elements use `disabled` - set both so this works on either.
  return React.cloneElement(children, { disabled: true, isDisabled: true } as Partial<unknown>);
}
