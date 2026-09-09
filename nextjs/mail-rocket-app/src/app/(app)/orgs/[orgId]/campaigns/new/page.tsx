"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import type { CampaignFormValues } from "@/lib/validation/campaignSchema";
import { useCreateCampaignMutation } from "@/features/campaigns";

export default function NewCampaignPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const [createCampaign, { isLoading, error }] = useCreateCampaignMutation();

  const onSubmit = async (values: CampaignFormValues) => {
    const result = await createCampaign({ organizationId: orgId, ...values, identity_id: values.identity_id || undefined });
    if (result.data) {
      router.push(`/orgs/${orgId}/campaigns/${result.data.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-primary">New campaign</h1>
      <CampaignForm
        mode="create"
        organizationId={orgId}
        onSubmit={onSubmit}
        isSubmitting={isLoading}
        error={error}
        onCancel={() => router.push(`/orgs/${orgId}/campaigns`)}
      />
    </div>
  );
}
