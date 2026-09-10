"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@untitledui/icons";
import { ResourceTable } from "@/components/data/ResourceTable";
import { LimitOffsetPagination } from "@/components/data/LimitOffsetPagination";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { usePaginationParams } from "@/hooks/usePaginationParams";
import { useGetTemplatesQuery } from "@/features/templates";

export default function TemplatesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const { limit, offset, setLimit, setOffset } = usePaginationParams();
  const { data: templates, isLoading, error } = useGetTemplatesQuery({ organizationId: orgId, limit, offset });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Templates</h1>
        <RequireRole atLeast="editor">
          <Button href={`/orgs/${orgId}/templates/new`} iconLeading={Plus}>
            New template
          </Button>
        </RequireRole>
      </div>

      <ResourceTable
        rows={templates}
        loading={isLoading}
        error={error}
        onRowClick={(row) => router.push(`/orgs/${orgId}/templates/${row.id}`)}
        columns={[
          { header: "Name", render: (t) => t.name },
          { header: "Linked campaign", render: (t) => (t.campaign_id ? "Yes" : "—") },
        ]}
      />

      <LimitOffsetPagination limit={limit} offset={offset} rowCount={templates?.length ?? 0} onLimitChange={setLimit} onOffsetChange={setOffset} />
    </div>
  );
}
