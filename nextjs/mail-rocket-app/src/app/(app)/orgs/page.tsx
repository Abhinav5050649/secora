"use client";

import Link from "next/link";
import { Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useGetMyOrganizationsQuery } from "@/features/session";
import { getApiErrorMessage } from "@/lib/redux/api/errors";

export default function OrgsPage() {
  const { data: organizations, isLoading, error } = useGetMyOrganizationsQuery();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Your organizations</h1>
        <Button href="/orgs/new" iconLeading={Plus}>
          New organization
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingIndicator size="sm" />
        </div>
      )}
      {error && <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">{getApiErrorMessage(error)}</p>}
      {!isLoading && organizations?.length === 0 && (
        <p className="text-sm text-tertiary">You&apos;re not a member of any organization yet. Create one to get started.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organizations?.map((org) => (
          <Link
            key={org.organization_id}
            href={`/orgs/${org.organization_id}`}
            className="flex flex-col gap-2 rounded-xl bg-primary p-5 ring-1 ring-secondary transition duration-100 ease-linear hover:bg-secondary"
          >
            <span className="truncate text-md font-semibold text-primary">{org.name}</span>
            <Badge size="sm" color="brand" className="w-max capitalize">
              {org.role}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
