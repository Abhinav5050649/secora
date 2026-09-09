import { apiSlice } from "@/lib/redux/api/apiSlice";
import type { User, UserOrganization } from "./model";

/**
 * `getMyOrganizations` is the single call that backs both the org switcher
 * and role-gating: it returns every org the current user belongs to *plus*
 * their role in each, so no second lookup is needed to answer "what's my
 * role in this org".
 */
export const sessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["Session"],
    }),
    getMyOrganizations: builder.query<UserOrganization[], void>({
      query: () => "/auth/me/organizations",
      providesTags: ["Session", "Membership"],
    }),
  }),
});

export const { useGetMeQuery, useGetMyOrganizationsQuery } = sessionApi;
