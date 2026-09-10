"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronSelectorVertical, Plus, Building07 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useGetMyOrganizationsQuery } from "@/features/session";

export function OrgSwitcher() {
  const router = useRouter();
  const params = useParams<{ orgId?: string }>();
  const { data: organizations, isLoading } = useGetMyOrganizationsQuery();

  if (isLoading) {
    return <LoadingIndicator size="sm" />;
  }

  const current = organizations?.find((org) => org.organization_id === params?.orgId);

  return (
    <Dropdown.Root>
      <AriaButton className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left outline-focus-ring ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2">
        <Building07 className="size-4 shrink-0 text-fg-quaternary" />
        <span className="flex-1 truncate text-sm font-semibold text-secondary">{current?.name || "Select organization"}</span>
        <ChevronSelectorVertical className="size-4 shrink-0 text-fg-quaternary" />
      </AriaButton>

      <Dropdown.Popover className="w-72">
        <Dropdown.Menu
          onAction={(key) => {
            router.push(key === "__new__" ? "/orgs/new" : `/orgs/${key}`);
          }}
        >
          <Dropdown.Section>
            {organizations?.map((org) => (
              <Dropdown.Item key={org.organization_id} id={org.organization_id} label={org.name ?? ""} addon={org.role} />
            ))}
          </Dropdown.Section>
          <Dropdown.Separator />
          <Dropdown.Item id="__new__" icon={Plus} label="New organization" />
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
