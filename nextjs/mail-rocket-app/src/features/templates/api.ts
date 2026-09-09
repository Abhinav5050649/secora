import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { PageArgs } from "@/types/resources";
import type { Template, TemplateInput } from "./model";

/**
 * Templates are reachable both org-wide (`getTemplates`) and campaign-nested
 * (`getCampaignTemplates`, a GET/POST-only view onto the same rows). Scoped
 * tag ids (`CAMPAIGN_<id>`) let a mutation refresh both cached views at once.
 */
export const templatesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<Template[], { organizationId: string } & PageArgs>({
      query: ({ organizationId, ...args }) => ({
        url: `/organizations/${organizationId}/templates`,
        params: args,
      }),
      providesTags: (result) => listTags("Template", result),
    }),
    getCampaignTemplates: builder.query<Template[], { organizationId: string; campaignId: string } & PageArgs>({
      query: ({ organizationId, campaignId, ...args }) => ({
        url: `/organizations/${organizationId}/campaigns/${campaignId}/templates`,
        params: args,
      }),
      providesTags: (result, _e, { campaignId }) => listTags("Template", result, [`CAMPAIGN_${campaignId}`]),
    }),
    getTemplate: builder.query<Template, { organizationId: string; templateId: string }>({
      query: ({ organizationId, templateId }) => `/organizations/${organizationId}/templates/${templateId}`,
      providesTags: (_r, _e, { templateId }) => itemTag("Template", templateId),
    }),
    createTemplate: builder.mutation<Template, { organizationId: string } & TemplateInput>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/templates`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => [
        { type: "Template", id: "LIST" },
        ...(result?.campaign_id ? [{ type: "Template" as const, id: `CAMPAIGN_${result.campaign_id}` }] : []),
      ],
    }),
    createCampaignTemplate: builder.mutation<
      Template,
      { organizationId: string; campaignId: string } & TemplateInput
    >({
      query: ({ organizationId, campaignId, ...body }) => ({
        url: `/organizations/${organizationId}/campaigns/${campaignId}/templates`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [
        { type: "Template", id: "LIST" },
        { type: "Template", id: `CAMPAIGN_${campaignId}` },
      ],
    }),
    updateTemplate: builder.mutation<
      Template,
      { organizationId: string; templateId: string } & Partial<TemplateInput>
    >({
      query: ({ organizationId, templateId, ...body }) => ({
        url: `/organizations/${organizationId}/templates/${templateId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _e, { templateId }) => [
        ...itemTag("Template", templateId),
        ...(result?.campaign_id ? [{ type: "Template" as const, id: `CAMPAIGN_${result.campaign_id}` }] : []),
      ],
    }),
    deleteTemplate: builder.mutation<void, { organizationId: string; templateId: string; campaignId?: string }>({
      query: ({ organizationId, templateId }) => ({
        url: `/organizations/${organizationId}/templates/${templateId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { templateId, campaignId }) => [
        ...itemTag("Template", templateId),
        { type: "Template", id: "LIST" },
        ...(campaignId ? [{ type: "Template" as const, id: `CAMPAIGN_${campaignId}` }] : []),
      ],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetCampaignTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useCreateCampaignTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = templatesApi;
