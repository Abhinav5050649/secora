import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { Identity, IdentityInput, IdentityListArgs } from "./model";

export const identitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIdentities: builder.query<Identity[], IdentityListArgs>({
      query: ({ organizationId, ...args }) => ({
        url: `/organizations/${organizationId}/identities`,
        params: args,
      }),
      providesTags: (result) => listTags("Identity", result),
    }),
    getIdentity: builder.query<Identity, { organizationId: string; identityId: string }>({
      query: ({ organizationId, identityId }) => `/organizations/${organizationId}/identities/${identityId}`,
      providesTags: (_r, _e, { identityId }) => itemTag("Identity", identityId),
    }),
    createIdentity: builder.mutation<Identity, { organizationId: string } & IdentityInput>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/identities`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Identity", id: "LIST" }],
    }),
    updateIdentity: builder.mutation<
      Identity,
      { organizationId: string; identityId: string } & Partial<IdentityInput>
    >({
      query: ({ organizationId, identityId, ...body }) => ({
        url: `/organizations/${organizationId}/identities/${identityId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { identityId }) => itemTag("Identity", identityId),
    }),
    deleteIdentity: builder.mutation<void, { organizationId: string; identityId: string }>({
      query: ({ organizationId, identityId }) => ({
        url: `/organizations/${organizationId}/identities/${identityId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { identityId }) => [
        ...itemTag("Identity", identityId),
        { type: "Identity", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetIdentitiesQuery,
  useGetIdentityQuery,
  useCreateIdentityMutation,
  useUpdateIdentityMutation,
  useDeleteIdentityMutation,
} = identitiesApi;
