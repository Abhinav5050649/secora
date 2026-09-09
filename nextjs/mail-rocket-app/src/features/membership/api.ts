import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { PageArgs, OrganizationUserRole } from "@/types/resources";
import type { OrganizationMembership, CreateMemberInput } from "./model";

export const membershipApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query<OrganizationMembership[], { organizationId: string } & PageArgs>({
      query: ({ organizationId, ...args }) => ({
        url: `/organizations/${organizationId}/users`,
        params: args,
      }),
      providesTags: (result) => listTags("Membership", result),
    }),
    createMember: builder.mutation<OrganizationMembership, CreateMemberInput>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/users`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Membership", id: "LIST" }],
    }),
    updateMember: builder.mutation<
      OrganizationMembership,
      { organizationId: string; userId: string; role: OrganizationUserRole }
    >({
      query: ({ organizationId, userId, ...body }) => ({
        url: `/organizations/${organizationId}/users/${userId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { userId }) => [...itemTag("Membership", userId), "Session"],
    }),
    removeMember: builder.mutation<void, { organizationId: string; userId: string }>({
      query: ({ organizationId, userId }) => ({
        url: `/organizations/${organizationId}/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { userId }) => [
        ...itemTag("Membership", userId),
        { type: "Membership", id: "LIST" },
        "Session",
      ],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
} = membershipApi;
