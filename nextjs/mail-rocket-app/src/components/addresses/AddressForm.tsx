"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/base/input/input";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Button } from "@/components/base/buttons/button";
import { getApiErrorMessage } from "@/lib/redux/api/errors";
import type { Address } from "@/types/resources";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

const addressSchema = z.object({
  street: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  is_primary: z.boolean(),
});
export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  mode: "create" | "edit";
  initialData?: Address;
  onSubmit: (values: AddressFormValues) => void;
  isSubmitting: boolean;
  error?: FetchBaseQueryError | SerializedError;
  onCancel?: () => void;
}

export function AddressForm({ mode, initialData, onSubmit, isSubmitting, error, onCancel }: AddressFormProps) {
  const { control, handleSubmit } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: initialData?.street ?? "",
      area: initialData?.area ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      country: initialData?.country ?? "",
      postal_code: initialData?.postal_code ?? "",
      is_primary: initialData?.is_primary ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-5">
      {error && <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">{getApiErrorMessage(error)}</p>}
      <Controller control={control} name="street" render={({ field }) => <Input {...field} label="Street" />} />
      <div className="flex gap-3">
        <Controller control={control} name="area" render={({ field }) => <Input {...field} label="Area" />} />
        <Controller control={control} name="city" render={({ field }) => <Input {...field} label="City" />} />
      </div>
      <div className="flex gap-3">
        <Controller control={control} name="state" render={({ field }) => <Input {...field} label="State" />} />
        <Controller control={control} name="postal_code" render={({ field }) => <Input {...field} label="Postal code" />} />
      </div>
      <Controller control={control} name="country" render={({ field }) => <Input {...field} label="Country" />} />
      <Controller
        control={control}
        name="is_primary"
        render={({ field }) => (
          <Checkbox label="Primary address" isSelected={field.value} onChange={field.onChange} />
        )}
      />
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Add address" : "Save changes"}
        </Button>
        {onCancel && (
          <Button type="button" color="link-gray" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
