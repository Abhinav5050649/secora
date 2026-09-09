"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@untitledui/icons";
import { ResourceTable } from "@/components/data/ResourceTable";
import { LimitOffsetPagination } from "@/components/data/LimitOffsetPagination";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { usePaginationParams } from "@/hooks/usePaginationParams";
import { useGetGroupsQuery } from "@/features/groups";

export default function GroupsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const { limit, offset, setLimit, setOffset } = usePaginationParams();
  const { data: groups, isLoading, error } = useGetGroupsQuery({ organizationId: orgId, limit, offset });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Groups</h1>
        <RequireRole atLeast="editor">
          <Button href={`/orgs/${orgId}/groups/new`} iconLeading={Plus}>
            New group
          </Button>
        </RequireRole>
      </div>

      <ResourceTable
        rows={groups}
        loading={isLoading}
        error={error}
        onRowClick={(row) => router.push(`/orgs/${orgId}/groups/${row.id}`)}
        columns={[
          { header: "Name", render: (g) => g.name },
          { header: "Linked campaign", render: (g) => (g.campaign_id ? "Yes" : "—") },
        ]}
      />

      <LimitOffsetPagination limit={limit} offset={offset} rowCount={groups?.length ?? 0} onLimitChange={setLimit} onOffsetChange={setOffset} />
    </div>
  );
}
