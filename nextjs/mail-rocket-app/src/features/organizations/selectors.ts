import type { RootState } from "@/lib/redux/store";

export const selectOrganizationFilters = (state: RootState) => state.organizations.filters;
export const selectOrganizationDialog = (state: RootState) => state.organizations.dialog;
