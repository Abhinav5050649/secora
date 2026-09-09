"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TemplateForm, type TemplateFormValues } from "@/components/templates/TemplateForm";
import { useCreateTemplateMutation } from "@/features/templates";

export default function NewTemplatePage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const [createTemplate, { isLoading, error }] = useCreateTemplateMutation();

  const onSubmit = async (values: TemplateFormValues) => {
    const result = await createTemplate({ organizationId: orgId, ...values, campaign_id: values.campaign_id || undefined });
    if (result.data) {
      router.push(`/orgs/${orgId}/templates/${result.data.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-primary">New template</h1>
      <TemplateForm
        mode="create"
        organizationId={orgId}
        defaultCampaignId={campaignId}
        onSubmit={onSubmit}
        isSubmitting={isLoading}
        error={error}
        onCancel={() => router.push(`/orgs/${orgId}/templates`)}
      />
    </div>
  );
}
