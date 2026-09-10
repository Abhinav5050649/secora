"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { getApiErrorMessage } from "@/lib/redux/api/errors";
import { useGetMeQuery } from "@/features/session";
import { useUpdateUserMutation } from "@/features/users";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: user, isLoading } = useGetMeQuery();
  const [updateUser, { isLoading: isSaving, error, isSuccess }] = useUpdateUserMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { first_name: user?.first_name ?? "", last_name: user?.last_name ?? "" },
  });

  const onSubmit = (values: ProfileFormValues) => {
    if (user) updateUser({ id: user.id, ...values });
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator size="sm" />
      </div>
    );
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="lg" initials={`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()} />
        <div>
          <h1 className="text-xl font-semibold text-primary">Profile</h1>
          <p className="text-sm text-tertiary">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {error && <p className="rounded-lg bg-error-primary px-3 py-2 text-sm text-error-primary ring-1 ring-error_subtle">{getApiErrorMessage(error)}</p>}
        {isSuccess && <p className="rounded-lg bg-success-primary px-3 py-2 text-sm text-success-primary ring-1 ring-success_subtle">Profile updated.</p>}
        <div className="flex gap-3">
          <Controller
            control={control}
            name="first_name"
            render={({ field }) => <Input {...field} label="First name" isInvalid={!!errors.first_name} hint={errors.first_name?.message} />}
          />
          <Controller
            control={control}
            name="last_name"
            render={({ field }) => <Input {...field} label="Last name" isInvalid={!!errors.last_name} hint={errors.last_name?.message} />}
          />
        </div>
        <Button type="submit" isLoading={isSaving} className="w-max">
          Save changes
        </Button>
      </form>
    </div>
  );
}
