import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { PageArgs } from "@/types/resources";
import type { Address, AddressInput } from "./model";

export const addressesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], { organizationId: string } & PageArgs>({
      query: ({ organizationId, ...args }) => ({
        url: `/organizations/${organizationId}/addresses`,
        params: args,
      }),
      providesTags: (result) => listTags("Address", result),
    }),
    getAddress: builder.query<Address, { organizationId: string; addressId: string }>({
      query: ({ organizationId, addressId }) => `/organizations/${organizationId}/addresses/${addressId}`,
      providesTags: (_r, _e, { addressId }) => itemTag("Address", addressId),
    }),
    createAddress: builder.mutation<Address, { organizationId: string } & AddressInput>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/addresses`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
    updateAddress: builder.mutation<
      Address,
      { organizationId: string; addressId: string } & Partial<AddressInput>
    >({
      query: ({ organizationId, addressId, ...body }) => ({
        url: `/organizations/${organizationId}/addresses/${addressId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { addressId }) => itemTag("Address", addressId),
    }),
    deleteAddress: builder.mutation<void, { organizationId: string; addressId: string }>({
      query: ({ organizationId, addressId }) => ({
        url: `/organizations/${organizationId}/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { addressId }) => [
        ...itemTag("Address", addressId),
        { type: "Address", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetAddressQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
