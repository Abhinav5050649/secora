"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { getApiErrorMessage } from "@/lib/redux/api/errors";
import type { ContactDetails } from "@/types/resources";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

const contactDetailsSchema = z.object({
  email_id: z.string().email("Enter a valid email").optional().or(z.literal("")),
  country_code: z.string().optional(),
  phone_number: z.string().optional(),
});
export type ContactDetailsFormValues = z.infer<typeof contactDetailsSchema>;

interface ContactDetailsFormProps {
  mode: "create" | "edit";
  initialData?: ContactDetails;
  onSubmit: (values: ContactDetailsFormValues) => void;
  isSubmitting: boolean;
  error?: FetchBaseQueryError | SerializedError;
  onCancel?: () => void;
}

export function ContactDetailsForm({ mode, initialData, onSubmit, isSubmitting, error, onCancel }: ContactDetailsFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactDetailsFormValues>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      email_id: initialData?.email_id ?? "",
      country_code: initialData?.country_code ?? "",
      phone_number: initialData?.phone_number ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-5">
      {error && <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">{getApiErrorMessage(error)}</p>}
      <Controller
        control={control}
        name="email_id"
        render={({ field }) => <Input {...field} label="Email" type="email" isInvalid={!!errors.email_id} hint={errors.email_id?.message} />}
      />
      <div className="flex gap-3">
        <Controller control={control} name="country_code" render={({ field }) => <Input {...field} label="Country code" className="w-32" />} />
        <Controller control={control} name="phone_number" render={({ field }) => <Input {...field} label="Phone number" />} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Add contact details" : "Save changes"}
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
