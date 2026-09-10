"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AddressForm, type AddressFormValues } from "@/components/addresses/AddressForm";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  useGetAddressQuery,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  selectAddressDialog,
  addressDeleteDialogOpened,
  addressDialogClosed,
} from "@/features/addresses";

export default function AddressDetailPage({ params }: { params: Promise<{ orgId: string; addressId: string }> }) {
  const { orgId, addressId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dialog = useAppSelector(selectAddressDialog);

  const { data: address, isLoading } = useGetAddressQuery({ organizationId: orgId, addressId });
  const [updateAddress, { isLoading: isSaving, error: updateError }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const onSubmit = (values: AddressFormValues) => {
    updateAddress({ organizationId: orgId, addressId, ...values });
  };

  const onDelete = async () => {
    const result = await deleteAddress({ organizationId: orgId, addressId });
    if (!("error" in result)) {
      router.push(`/orgs/${orgId}/addresses`);
    }
  };

  if (isLoading || !address) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator size="sm" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <RequireRole atLeast="editor">
        <AddressForm mode="edit" initialData={address} onSubmit={onSubmit} isSubmitting={isSaving} error={updateError} />
      </RequireRole>

      <RequireRole atLeast="admin">
        <div className="flex flex-col gap-3 border-t border-secondary pt-6">
          <h2 className="text-sm font-semibold text-error-primary">Danger zone</h2>
          <Button type="button" color="secondary-destructive" className="w-max" onClick={() => dispatch(addressDeleteDialogOpened(addressId))}>
            Delete address
          </Button>
        </div>
      </RequireRole>

      <ConfirmDialog
        isOpen={dialog?.type === "delete"}
        onOpenChange={(open) => !open && dispatch(addressDialogClosed())}
        title="Delete this address?"
        description="This can't be undone."
        isLoading={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
