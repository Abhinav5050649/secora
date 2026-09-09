export type { Recipient } from "@/types/resources";

export interface RecipientInput {
  first_name?: string;
  last_name?: string;
  email_id: string;
  group_id?: string;
  campaign_id?: string;
}

export type RecipientFilters = object;
