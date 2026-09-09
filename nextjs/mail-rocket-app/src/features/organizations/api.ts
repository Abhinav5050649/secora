import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { PageArgs } from "@/types/resources";
import type { Organization, OrganizationInput } from "./model";

/** RTK Query endpoints - the "effects" for the organizations feature. */
export const organizationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<Organization[], PageArgs | void>({
      query: (args) => ({ url: "/organizations", params: args ?? undefined }),
      providesTags: (result) => listTags("Organization", result),
    }),
    getOrganization: builder.query<Organization, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: (_r, _e, id) => itemTag("Organization", id),
    }),
    createOrganization: builder.mutation<Organization, OrganizationInput>({
      query: (body) => ({ url: "/organizations", method: "POST", body }),
      // A new org also changes the caller's own membership list.
      invalidatesTags: [{ type: "Organization", id: "LIST" }, "Membership", "Session"],
    }),
    updateOrganization: builder.mutation<Organization, { id: string } & Partial<OrganizationInput>>({
      query: ({ id, ...body }) => ({ url: `/organizations/${id}`, method: "PATCH", body }),
      invalidatesTags: (_r, _e, { id }) => itemTag("Organization", id),
    }),
    deleteOrganization: builder.mutation<void, string>({
      query: (id) => ({ url: `/organizations/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        ...itemTag("Organization", id),
        { type: "Organization", id: "LIST" },
        "Membership",
        "Session",
      ],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} = organizationsApi;
