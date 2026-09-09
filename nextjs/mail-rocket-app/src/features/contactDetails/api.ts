import { apiSlice } from "@/lib/redux/api/apiSlice";
import { listTags, itemTag } from "@/lib/redux/api/tagHelpers";
import type { PageArgs } from "@/types/resources";
import type { ContactDetails, ContactDetailsInput } from "./model";

export const contactDetailsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getContactDetailsList: builder.query<ContactDetails[], { organizationId: string } & PageArgs>({
      query: ({ organizationId, ...args }) => ({
        url: `/organizations/${organizationId}/contact-details`,
        params: args,
      }),
      providesTags: (result) => listTags("ContactDetails", result),
    }),
    getContactDetails: builder.query<ContactDetails, { organizationId: string; contactDetailsId: string }>({
      query: ({ organizationId, contactDetailsId }) =>
        `/organizations/${organizationId}/contact-details/${contactDetailsId}`,
      providesTags: (_r, _e, { contactDetailsId }) => itemTag("ContactDetails", contactDetailsId),
    }),
    createContactDetails: builder.mutation<ContactDetails, { organizationId: string } & ContactDetailsInput>({
      query: ({ organizationId, ...body }) => ({
        url: `/organizations/${organizationId}/contact-details`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ContactDetails", id: "LIST" }],
    }),
    updateContactDetails: builder.mutation<
      ContactDetails,
      { organizationId: string; contactDetailsId: string } & Partial<ContactDetailsInput>
    >({
      query: ({ organizationId, contactDetailsId, ...body }) => ({
        url: `/organizations/${organizationId}/contact-details/${contactDetailsId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { contactDetailsId }) => itemTag("ContactDetails", contactDetailsId),
    }),
    deleteContactDetails: builder.mutation<void, { organizationId: string; contactDetailsId: string }>({
      query: ({ organizationId, contactDetailsId }) => ({
        url: `/organizations/${organizationId}/contact-details/${contactDetailsId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { contactDetailsId }) => [
        ...itemTag("ContactDetails", contactDetailsId),
        { type: "ContactDetails", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetContactDetailsListQuery,
  useGetContactDetailsQuery,
  useCreateContactDetailsMutation,
  useUpdateContactDetailsMutation,
  useDeleteContactDetailsMutation,
} = contactDetailsApi;
