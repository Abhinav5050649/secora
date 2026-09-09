export type { Organization } from "@/types/resources";

export interface OrganizationInput {
  name: string;
  description?: string;
}

/** No list filters exist for organizations today; kept as an alias so the slice factory stays uniform across features. */
export type OrganizationFilters = object;
