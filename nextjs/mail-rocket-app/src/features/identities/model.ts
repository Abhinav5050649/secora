export type { Identity, IdentityType, IdentityStatus, IdentityVerificationRecord } from "@/types/resources";
import type { IdentityStatus, IdentityType, PageArgs } from "@/types/resources";

export interface IdentityListArgs extends PageArgs {
  organizationId: string;
  type?: IdentityType;
  status?: IdentityStatus;
}

export interface IdentityInput {
  type: IdentityType;
  identity: string;
}

export interface IdentityFilters {
  type?: IdentityType;
  status?: IdentityStatus;
}
