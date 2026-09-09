export type { OrganizationMembership, OrganizationUserRole } from "@/types/resources";
import type { OrganizationUserRole } from "@/types/resources";

export interface CreateMemberInput {
  organizationId: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: OrganizationUserRole;
}

export interface MembershipFilters {
  role?: OrganizationUserRole;
}
