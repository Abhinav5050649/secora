"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { OrganizationForm, type OrganizationFormValues } from "@/components/organizations/OrganizationForm";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  selectOrganizationDialog,
  organizationDeleteDialogOpened,
  organizationDialogClosed,
} from "@/features/organizations";

export default function OrgSettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dialog = useAppSelector(selectOrganizationDialog);

  const { data: organization, isLoading } = useGetOrganizationQuery(orgId);
  const [updateOrganization, { isLoading: isSaving, error: updateError }] = useUpdateOrganizationMutation();
  const [deleteOrganization, { isLoading: isDeleting, error: deleteError }] = useDeleteOrganizationMutation();

  const onSubmit = (values: OrganizationFormValues) => {
    updateOrganization({ id: orgId, ...values });
  };

  const onDelete = async () => {
    const result = await deleteOrganization(orgId);
    if (!("error" in result)) {
      router.push("/orgs");
    }
  };

  if (isLoading || !organization) return null;

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <h1 className="text-xl font-semibold text-primary">Organization settings</h1>

      <RequireRole atLeast="admin">
        <OrganizationForm mode="edit" initialData={organization} onSubmit={onSubmit} isSubmitting={isSaving} error={updateError} />
      </RequireRole>

      <RequireRole atLeast="admin">
        <div className="flex flex-col gap-3 border-t border-secondary pt-6">
          <h2 className="text-sm font-semibold text-error-primary">Danger zone</h2>
          {deleteError && (
            <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">Failed to delete organization.</p>
          )}
          <Button
            type="button"
            color="secondary-destructive"
            className="w-max"
            onClick={() => dispatch(organizationDeleteDialogOpened(orgId))}
          >
            Delete organization
          </Button>
        </div>
      </RequireRole>

      <ConfirmDialog
        isOpen={dialog?.type === "delete"}
        onOpenChange={(open) => !open && dispatch(organizationDialogClosed())}
        title="Delete this organization?"
        description={`This permanently removes ${organization.name} and every campaign, template, group, and recipient in it. This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
