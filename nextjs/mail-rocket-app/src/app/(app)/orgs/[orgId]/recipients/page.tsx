"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@untitledui/icons";
import { ResourceTable } from "@/components/data/ResourceTable";
import { LimitOffsetPagination } from "@/components/data/LimitOffsetPagination";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { usePaginationParams } from "@/hooks/usePaginationParams";
import { useGetRecipientsQuery } from "@/features/recipients";

export default function RecipientsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const { limit, offset, setLimit, setOffset } = usePaginationParams();
  const { data: recipients, isLoading, error } = useGetRecipientsQuery({ organizationId: orgId, limit, offset });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Recipients</h1>
        <RequireRole atLeast="editor">
          <Button href={`/orgs/${orgId}/recipients/new`} iconLeading={Plus}>
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
      />

      <LimitOffsetPagination limit={limit} offset={offset} rowCount={recipients?.length ?? 0} onLimitChange={setLimit} onOffsetChange={setOffset} />
    </div>
  );
}
