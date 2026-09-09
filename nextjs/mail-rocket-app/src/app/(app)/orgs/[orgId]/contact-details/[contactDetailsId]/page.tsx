"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ContactDetailsForm, type ContactDetailsFormValues } from "@/components/contactDetails/ContactDetailsForm";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  useGetContactDetailsQuery,
  useUpdateContactDetailsMutation,
  useDeleteContactDetailsMutation,
  selectContactDetailsDialog,
  contactDetailsDeleteDialogOpened,
  contactDetailsDialogClosed,
} from "@/features/contactDetails";

export default function ContactDetailsDetailPage({ params }: { params: Promise<{ orgId: string; contactDetailsId: string }> }) {
  const { orgId, contactDetailsId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dialog = useAppSelector(selectContactDetailsDialog);

  const { data: contactDetails, isLoading } = useGetContactDetailsQuery({ organizationId: orgId, contactDetailsId });
  const [updateContactDetails, { isLoading: isSaving, error: updateError }] = useUpdateContactDetailsMutation();
  const [deleteContactDetails, { isLoading: isDeleting }] = useDeleteContactDetailsMutation();

  const onSubmit = (values: ContactDetailsFormValues) => {
    updateContactDetails({ organizationId: orgId, contactDetailsId, ...values });
  };

  const onDelete = async () => {
    const result = await deleteContactDetails({ organizationId: orgId, contactDetailsId });
    if (!("error" in result)) {
      router.push(`/orgs/${orgId}/contact-details`);
    }
  };

  if (isLoading || !contactDetails) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator size="sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <RequireRole atLeast="editor">
        <ContactDetailsForm mode="edit" initialData={contactDetails} onSubmit={onSubmit} isSubmitting={isSaving} error={updateError} />
      </RequireRole>

      <RequireRole atLeast="admin">
        <div className="flex flex-col gap-3 border-t border-secondary pt-6">
          <h2 className="text-sm font-semibold text-error-primary">Danger zone</h2>
          <Button
            type="button"
            color="secondary-destructive"
            className="w-max"
            onClick={() => dispatch(contactDetailsDeleteDialogOpened(contactDetailsId))}
          >
            Delete contact details
          </Button>
        </div>
      </RequireRole>

      <ConfirmDialog
        isOpen={dialog?.type === "delete"}
        onOpenChange={(open) => !open && dispatch(contactDetailsDialogClosed())}
        title="Delete these contact details?"
        description="This can't be undone."
        isLoading={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
