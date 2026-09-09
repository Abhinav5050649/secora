"use client";

import { useRouter } from "next/navigation";
import { OrganizationForm, type OrganizationFormValues } from "@/components/organizations/OrganizationForm";
import { useCreateOrganizationMutation } from "@/features/organizations";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [createOrganization, { isLoading, error }] = useCreateOrganizationMutation();

  const onSubmit = async (values: OrganizationFormValues) => {
    const result = await createOrganization(values);
    if (result.data) {
      router.push(`/orgs/${result.data.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-primary">New organization</h1>
      <OrganizationForm mode="create" onSubmit={onSubmit} isSubmitting={isLoading} error={error} onCancel={() => router.push("/orgs")} />
    </div>
  );
}
