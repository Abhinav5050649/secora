"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/base/input/input";
import { NativeSelect } from "@/components/base/select/select-native";
import { Button } from "@/components/base/buttons/button";
import { getApiErrorMessage } from "@/lib/redux/api/errors";
import { useCreateMemberMutation } from "@/features/membership";
import { useCurrentOrgRole, ROLE_RANK } from "@/hooks/useCurrentOrgRole";

const memberSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.enum(["viewer", "editor", "admin", "owner"]),
});
type MemberFormValues = z.infer<typeof memberSchema>;

const ALL_ROLE_OPTIONS = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Admin", value: "admin" },
  { label: "Owner", value: "owner" },
];

export default function NewMemberPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const [createMember, { isLoading, error }] = useCreateMemberMutation();
  const { role: currentRole } = useCurrentOrgRole();
  // The backend rejects assigning a role ranked above the caller's own - only
  // offer roles a member can actually grant, so the request can't 403.
  const ROLE_OPTIONS = ALL_ROLE_OPTIONS.filter((option) => !currentRole || ROLE_RANK[option.value as keyof typeof ROLE_RANK] <= ROLE_RANK[currentRole]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema), defaultValues: { role: "viewer" } });

  const onSubmit = async (values: MemberFormValues) => {
    const result = await createMember({ organizationId: orgId, ...values });
    if (!("error" in result)) {
      router.push(`/orgs/${orgId}/members`);
    }
  };

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="text-xl font-semibold text-primary">Add member</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {error && <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">{getApiErrorMessage(error)}</p>}
        <Controller
          control={control}
          name="email"
          render={({ field }) => <Input {...field} label="Email" type="email" isInvalid={!!errors.email} hint={errors.email?.message} />}
        />
        <div className="flex gap-3">
          <Controller control={control} name="first_name" render={({ field }) => <Input {...field} label="First name" />} />
          <Controller control={control} name="last_name" render={({ field }) => <Input {...field} label="Last name" />} />
        </div>
        <NativeSelect label="Role" options={ROLE_OPTIONS} {...register("role")} />
        <div className="flex gap-3">
          <Button type="submit" isLoading={isLoading}>
            Add member
          </Button>
          <Button type="button" color="link-gray" onClick={() => router.push(`/orgs/${orgId}/members`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
