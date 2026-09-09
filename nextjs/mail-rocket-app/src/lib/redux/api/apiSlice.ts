import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Every resource's `injectEndpoints` module builds on this base. `baseUrl`
 * points at this app's own `/api` Route Handlers (the BFF proxy), never at
 * bun/api directly, so the httpOnly session cookie rides along automatically
 * via `credentials: "include"` and the JWT never reaches client JS.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: [
    "Session",
    "Organization",
    "Membership",
    "User",
    "Address",
    "ContactDetails",
    "Identity",
    "Campaign",
    "Template",
    "Group",
    "Recipient",
  ],
  endpoints: () => ({}),
});
