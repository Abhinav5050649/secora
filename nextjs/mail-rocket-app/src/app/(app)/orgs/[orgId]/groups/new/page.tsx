"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GroupForm, type GroupFormValues } from "@/components/groups/GroupForm";
import { useCreateGroupMutation } from "@/features/groups";

export default function NewGroupPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const [createGroup, { isLoading, error }] = useCreateGroupMutation();

  const onSubmit = async (values: GroupFormValues) => {
    const result = await createGroup({ organizationId: orgId, ...values, campaign_id: values.campaign_id || undefined });
    if (result.data) {
      router.push(`/orgs/${orgId}/groups/${result.data.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-primary">New group</h1>
      <GroupForm
        mode="create"
        organizationId={orgId}
        defaultCampaignId={campaignId}
        onSubmit={onSubmit}
        isSubmitting={isLoading}
        error={error}
        onCancel={() => router.push(`/orgs/${orgId}/groups`)}
      />
    </div>
  );
}
