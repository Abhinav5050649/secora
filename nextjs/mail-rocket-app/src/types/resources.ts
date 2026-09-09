/**
 * TS shapes mirrored from bun/api's Drizzle models (bun/api/src/models/*.ts).
 * Timestamps arrive over the wire as ISO strings, not `Date` instances.
 */

interface BaseFields {
  id: string;
  entity: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface User extends BaseFields {
  first_name: string | null;
  last_name: string | null;
  email: string;
  normalized_name: string | null;
  // password_hash is stripped server-side (toPublicUser) - never present.
}

export interface Organization extends BaseFields {
  name: string | null;
  normalized_name: string | null;
}

export type OrganizationUserRole = "viewer" | "editor" | "admin";

/** Shape returned by GET /organizations/:id/users (membership + denormalized user fields). */
export interface OrganizationMembership {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationUserRole;
  first_name: string | null;
  last_name: string | null;
  normalized_name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

/** Shape returned by GET /users/:id/organizations (the mirror of OrganizationMembership). */
export interface UserOrganization {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationUserRole;
  name: string | null;
  normalized_name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Address extends BaseFields {
  street: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  is_primary: boolean;
  organization_id: string;
  user_id: string | null;
}

export interface ContactDetails extends BaseFields {
  email_id: string | null;
  country_code: string | null;
  phone_number: string | null;
  organization_id: string;
  user_id: string | null;
}

export type IdentityType = "domain" | "email";
export type IdentityStatus = "created" | "pending" | "active";

export interface IdentityVerificationRecord {
  type: "TXT" | "CNAME";
  name: string;
  value: string;
}

export interface Identity extends BaseFields {
  type: IdentityType;
  identity: string;
  organization_id: string;
  status: IdentityStatus;
  verification_records: IdentityVerificationRecord[] | null;
}

/** Lifecycle: draft -> scheduled -> sending -> sent | send_failed (see CampaignModel.ts). */
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "send_failed";

export interface Campaign extends BaseFields {
  name: string | null;
  subject: string | null;
  logo_key: string | null;
  logo_bucket: string | null;
  organization_id: string;
  start_time: string | null;
  organizer_id: string | null;
  normalized_name: string | null;
  status: CampaignStatus;
  identity_id: string | null;
  send_failure_reason: string | null;
}

export interface Template extends BaseFields {
  name: string | null;
  html_body: string | null;
  campaign_id: string | null;
  organization_id: string;
  normalized_name: string | null;
}

export interface Group extends BaseFields {
  name: string | null;
  campaign_id: string | null;
  organization_id: string;
  creator_id: string | null;
  normalized_name: string | null;
}

export interface Recipient extends BaseFields {
  first_name: string | null;
  last_name: string | null;
  normalized_name: string | null;
  email_id: string | null;
  group_id: string | null;
  campaign_id: string | null;
  organization_id: string;
}

/** Standard limit/offset pagination args every list endpoint accepts. */
export interface PageArgs {
  limit?: number;
  offset?: number;
}

export const DEFAULT_PAGE_SIZE = 10;
