import { apiSlice } from "@/lib/redux/api/apiSlice";
import type { User, UpdateUserInput } from "./model";

/** Self-service profile editing (requireSelf-gated on the backend). */
export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<User, { id: string } & UpdateUserInput>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const { useUpdateUserMutation } = usersApi;
