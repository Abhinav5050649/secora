"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { TemplateForm, type TemplateFormValues } from "@/components/templates/TemplateForm";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  useGetTemplateQuery,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  selectTemplateDialog,
  templateDeleteDialogOpened,
  templateDialogClosed,
} from "@/features/templates";

export default function TemplateDetailPage({ params }: { params: Promise<{ orgId: string; templateId: string }> }) {
  const { orgId, templateId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dialog = useAppSelector(selectTemplateDialog);

  const { data: template, isLoading } = useGetTemplateQuery({ organizationId: orgId, templateId });
  const [updateTemplate, { isLoading: isSaving, error: updateError }] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();

  const onSubmit = (values: TemplateFormValues) => {
    updateTemplate({ organizationId: orgId, templateId, ...values, campaign_id: values.campaign_id || undefined });
  };

  const onDelete = async () => {
    const result = await deleteTemplate({ organizationId: orgId, templateId, campaignId: template?.campaign_id ?? undefined });
    if (!("error" in result)) {
      router.push(`/orgs/${orgId}/templates`);
    }
  };

  if (isLoading || !template) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator size="sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <RequireRole atLeast="editor">
        <TemplateForm mode="edit" organizationId={orgId} initialData={template} onSubmit={onSubmit} isSubmitting={isSaving} error={updateError} />
      </RequireRole>

      <RequireRole atLeast="admin">
        <div className="flex flex-col gap-3 border-t border-secondary pt-6">
          <h2 className="text-sm font-semibold text-error-primary">Danger zone</h2>
          <Button type="button" color="secondary-destructive" className="w-max" onClick={() => dispatch(templateDeleteDialogOpened(templateId))}>
            Delete template
          </Button>
        </div>
      </RequireRole>

      <ConfirmDialog
        isOpen={dialog?.type === "delete"}
        onOpenChange={(open) => !open && dispatch(templateDialogClosed())}
        title="Delete this template?"
        description="This can't be undone."
        isLoading={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
