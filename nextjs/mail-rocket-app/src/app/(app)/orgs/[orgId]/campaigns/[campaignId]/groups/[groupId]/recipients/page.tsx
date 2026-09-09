"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "@untitledui/icons";
import { ResourceTable } from "@/components/data/ResourceTable";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { useGetGroupRecipientsQuery } from "@/features/recipients";
import { useGetGroupQuery } from "@/features/groups";

export default function CampaignGroupRecipientsPage({
  params,
}: {
  params: Promise<{ orgId: string; campaignId: string; groupId: string }>;
}) {
  const { orgId, campaignId, groupId } = use(params);
  const router = useRouter();
  const { data: group } = useGetGroupQuery({ organizationId: orgId, groupId });
  const { data: recipients, isLoading, error } = useGetGroupRecipientsQuery({ organizationId: orgId, campaignId, groupId, limit: 50 });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/orgs/${orgId}/campaigns/${campaignId}/groups`}
        className="flex w-max items-center gap-1.5 text-sm font-semibold text-tertiary hover:text-secondary"
      >
        <ArrowLeft className="size-4" />
        Back to groups
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Recipients in {group?.name ?? "group"}</h2>
        <RequireRole atLeast="editor">
          <Button href={`/orgs/${orgId}/recipients/new?campaignId=${campaignId}&groupId=${groupId}`} iconLeading={Plus} size="sm">
            Add recipient
          </Button>
        </RequireRole>
      </div>

      <ResourceTable
        rows={recipients}
        loading={isLoading}
        error={error}
        onRowClick={(row) => router.push(`/orgs/${orgId}/recipients/${row.id}`)}
        columns={[
          { header: "Name", render: (r) => `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—" },
          { header: "Email", render: (r) => r.email_id },
        ]}
        emptyMessage="No recipients in this group yet."
      />
    </div>
  );
}
