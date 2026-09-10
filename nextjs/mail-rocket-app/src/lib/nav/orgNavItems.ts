import {
  BarChart03,
  Building07,
  Contrast01,
  Home02,
  Mail01,
  Settings01,
  Shield01,
  Users01,
  UsersPlus,
  UserSquare,
} from "@untitledui/icons";
import type { NavItemType } from "@/components/application/app-navigation/config";

/** Subset of items surfaced in the mobile bottom row/quick links - keep this short. */
export const PRIMARY_NAV_LABELS = ["Dashboard", "Campaigns", "Templates", "Recipients"];

export function buildOrgNavItems(orgId: string): NavItemType[] {
  return [
    { label: "Dashboard", href: `/orgs/${orgId}`, icon: Home02 },
    { label: "Campaigns", href: `/orgs/${orgId}/campaigns`, icon: BarChart03 },
    { label: "Templates", href: `/orgs/${orgId}/templates`, icon: Mail01 },
    { label: "Groups", href: `/orgs/${orgId}/groups`, icon: Users01 },
    { label: "Recipients", href: `/orgs/${orgId}/recipients`, icon: UserSquare },
    { label: "Identities", href: `/orgs/${orgId}/identities`, icon: Shield01 },
    { label: "Addresses", href: `/orgs/${orgId}/addresses`, icon: Building07 },
    { label: "Contact details", href: `/orgs/${orgId}/contact-details`, icon: Contrast01 },
    { label: "Members", href: `/orgs/${orgId}/members`, icon: UsersPlus },
    { label: "Settings", href: `/orgs/${orgId}/settings`, icon: Settings01 },
  ];
}
