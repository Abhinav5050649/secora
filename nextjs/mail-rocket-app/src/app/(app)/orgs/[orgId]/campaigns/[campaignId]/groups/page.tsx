"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@untitledui/icons";
import { ResourceTable } from "@/components/data/ResourceTable";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { useGetCampaignGroupsQuery } from "@/features/groups";

export default function CampaignGroupsPage({ params }: { params: Promise<{ orgId: string; campaignId: string }> }) {
  const { orgId, campaignId } = use(params);
  const router = useRouter();
  const { data: groups, isLoading, error } = useGetCampaignGroupsQuery({ organizationId: orgId, campaignId, limit: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Groups</h2>
        <RequireRole atLeast="editor">
          <Button href={`/orgs/${orgId}/groups/new?campaignId=${campaignId}`} iconLeading={Plus} size="sm">
            New group
          </Button>
        </RequireRole>
      </div>

      <ResourceTable
        rows={groups}
        loading={isLoading}
        error={error}
        onRowClick={(row) => router.push(`/orgs/${orgId}/campaigns/${campaignId}/groups/${row.id}/recipients`)}
        columns={[{ header: "Name", render: (g) => g.name }]}
        emptyMessage="No groups linked to this campaign yet."
      />
    </div>
  );
}
