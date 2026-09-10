import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { Campaign, CampaignInput, CampaignListArgs } from "./model";

/**
 * Reference implementation of the per-resource RTK Query pattern: list query
 * tags every row + a LIST sentinel, get-by-id tags its own id, create
 * invalidates LIST, update/delete invalidate their own id (+ LIST on
 * delete). The other resource features (templates, groups, recipients,
 * identities, addresses, contact details, membership, organizations) repeat
 * this shape.
 */
export const campaignsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<Campaign[], CampaignListArgs>({
      query: ({ organizationId, ...args }) => ({
        url: `/organizations/${organizationId}/campaigns`,
        params: args,
      }),
      providesTags: (result) => listTags("Campaign", result),
    }),
    getCampaign: builder.query<Campaign, { organizationId: string; campaignId: string }>({
      query: ({ organizationId, campaignId }) => `/organizations/${organizationId}/campaigns/${campaignId}`,
      providesTags: (_r, _e, { campaignId }) => itemTag("Campaign", campaignId),
    }),
    createCampaign: builder.mutation<Campaign, { organizationId: string } & CampaignInput>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/campaigns`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Campaign", id: "LIST" }],
    }),
    updateCampaign: builder.mutation<
      Campaign,
      { organizationId: string; campaignId: string } & Partial<CampaignInput>
    >({
      query: ({ organizationId, campaignId, ...body }) => ({
        url: `/organizations/${organizationId}/campaigns/${campaignId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => itemTag("Campaign", campaignId),
    }),
    deleteCampaign: builder.mutation<void, { organizationId: string; campaignId: string }>({
      query: ({ organizationId, campaignId }) => ({
        url: `/organizations/${organizationId}/campaigns/${campaignId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [
        ...itemTag("Campaign", campaignId),
        { type: "Campaign", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = campaignsApi;
