"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecipientForm, type RecipientFormValues } from "@/components/recipients/RecipientForm";
import { useCreateRecipientMutation } from "@/features/recipients";

export default function NewRecipientPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const groupId = searchParams.get("groupId") ?? undefined;
  const [createRecipient, { isLoading, error }] = useCreateRecipientMutation();

  const onSubmit = async (values: RecipientFormValues) => {
    const result = await createRecipient({
      organizationId: orgId,
      ...values,
      campaign_id: values.campaign_id || undefined,
      group_id: values.group_id || undefined,
    });
    if (result.data) {
      router.push(`/orgs/${orgId}/recipients/${result.data.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-primary">Add recipient</h1>
      <RecipientForm
        mode="create"
        organizationId={orgId}
        defaultCampaignId={campaignId}
        defaultGroupId={groupId}
        onSubmit={onSubmit}
        isSubmitting={isLoading}
        error={error}
        onCancel={() => router.push(`/orgs/${orgId}/recipients`)}
      />
    </div>
  );
}
