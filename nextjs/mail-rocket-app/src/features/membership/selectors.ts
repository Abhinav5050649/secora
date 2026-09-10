import type { RootState } from "@/lib/redux/store";

export const selectMembershipFilters = (state: RootState) => state.membership.filters;
export const selectMembershipDialog = (state: RootState) => state.membership.dialog;
