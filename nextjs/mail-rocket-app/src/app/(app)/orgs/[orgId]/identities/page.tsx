"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@untitledui/icons";
import { ResourceTable } from "@/components/data/ResourceTable";
import { LimitOffsetPagination } from "@/components/data/LimitOffsetPagination";
import { IdentityStatusBadge } from "@/components/identities/IdentityStatusBadge";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { NativeSelect } from "@/components/base/select/select-native";
import { usePaginationParams } from "@/hooks/usePaginationParams";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useGetIdentitiesQuery, selectIdentityFilters, identityFiltersChanged } from "@/features/identities";
import type { IdentityStatus, IdentityType } from "@/types/resources";

const TYPE_OPTIONS = [
  { label: "All types", value: "" },
  { label: "Domain", value: "domain" },
  { label: "Email", value: "email" },
];
const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Created", value: "created" },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
];

export default function IdentitiesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectIdentityFilters);
  const { limit, offset, setLimit, setOffset } = usePaginationParams();

  const { data: identities, isLoading, error } = useGetIdentitiesQuery({ organizationId: orgId, ...filters, limit, offset });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Identities</h1>
        <RequireRole atLeast="editor">
          <Button href={`/orgs/${orgId}/identities/new`} iconLeading={Plus}>
            New identity
          </Button>
        </RequireRole>
      </div>

      <div className="flex gap-3">
        <NativeSelect
          className="w-40"
          size="sm"
          options={TYPE_OPTIONS}
          value={filters.type ?? ""}
          onChange={(e) => {
            dispatch(identityFiltersChanged({ type: (e.target.value || undefined) as IdentityType | undefined }));
            setOffset(0);
          }}
        />
        <NativeSelect
          className="w-40"
          size="sm"
          options={STATUS_OPTIONS}
          value={filters.status ?? ""}
          onChange={(e) => {
            dispatch(identityFiltersChanged({ status: (e.target.value || undefined) as IdentityStatus | undefined }));
            setOffset(0);
          }}
        />
      </div>

      <ResourceTable
        rows={identities}
        loading={isLoading}
        error={error}
        onRowClick={(row) => router.push(`/orgs/${orgId}/identities/${row.id}`)}
        columns={[
          { header: "Identity", render: (i) => i.identity },
          { header: "Type", render: (i) => <span className="capitalize">{i.type}</span> },
          { header: "Status", render: (i) => <IdentityStatusBadge status={i.status} /> },
        ]}
      />

      <LimitOffsetPagination limit={limit} offset={offset} rowCount={identities?.length ?? 0} onLimitChange={setLimit} onOffsetChange={setOffset} />
    </div>
  );
}
