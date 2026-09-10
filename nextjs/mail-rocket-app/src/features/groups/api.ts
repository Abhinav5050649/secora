import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { PageArgs } from "@/types/resources";
import type { Group, GroupInput } from "./model";

export const groupsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGroups: builder.query<Group[], { organizationId: string } & PageArgs>({
      query: ({ organizationId, ...args }) => ({
        url: `/organizations/${organizationId}/groups`,
        params: args,
      }),
      providesTags: (result) => listTags("Group", result),
    }),
    getCampaignGroups: builder.query<Group[], { organizationId: string; campaignId: string } & PageArgs>({
      query: ({ organizationId, campaignId, ...args }) => ({
        url: `/organizations/${organizationId}/campaigns/${campaignId}/groups`,
        params: args,
      }),
      providesTags: (result, _e, { campaignId }) => listTags("Group", result, [`CAMPAIGN_${campaignId}`]),
    }),
    getGroup: builder.query<Group, { organizationId: string; groupId: string }>({
      query: ({ organizationId, groupId }) => `/organizations/${organizationId}/groups/${groupId}`,
      providesTags: (_r, _e, { groupId }) => itemTag("Group", groupId),
    }),
    createGroup: builder.mutation<Group, { organizationId: string } & GroupInput>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/groups`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => [
        { type: "Group", id: "LIST" },
        ...(result?.campaign_id ? [{ type: "Group" as const, id: `CAMPAIGN_${result.campaign_id}` }] : []),
      ],
    }),
    createCampaignGroup: builder.mutation<Group, { organizationId: string; campaignId: string } & GroupInput>({
      query: ({ organizationId, campaignId, ...body }) => ({
        url: `/organizations/${organizationId}/campaigns/${campaignId}/groups`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [
        { type: "Group", id: "LIST" },
        { type: "Group", id: `CAMPAIGN_${campaignId}` },
      ],
    }),
    updateGroup: builder.mutation<Group, { organizationId: string; groupId: string } & Partial<GroupInput>>({
      query: ({ organizationId, groupId, ...body }) => ({
        url: `/organizations/${organizationId}/groups/${groupId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, _e, { groupId }) => [
        ...itemTag("Group", groupId),
        ...(result?.campaign_id ? [{ type: "Group" as const, id: `CAMPAIGN_${result.campaign_id}` }] : []),
      ],
    }),
    deleteGroup: builder.mutation<void, { organizationId: string; groupId: string; campaignId?: string }>({
      query: ({ organizationId, groupId }) => ({
        url: `/organizations/${organizationId}/groups/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { groupId, campaignId }) => [
        ...itemTag("Group", groupId),
        { type: "Group", id: "LIST" },
        ...(campaignId ? [{ type: "Group" as const, id: `CAMPAIGN_${campaignId}` }] : []),
      ],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetCampaignGroupsQuery,
  useGetGroupQuery,
  useCreateGroupMutation,
  useCreateCampaignGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} = groupsApi;
