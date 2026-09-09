import { createListFeatureSlice } from "@/lib/redux/createListFeatureSlice";
import type { OrganizationFilters } from "./model";

const organizationsSlice = createListFeatureSlice<OrganizationFilters>("organizations", {});

export const {
  filtersChanged: organizationFiltersChanged,
  filtersCleared: organizationFiltersCleared,
  createDialogOpened: organizationCreateDialogOpened,
  editDialogOpened: organizationEditDialogOpened,
  deleteDialogOpened: organizationDeleteDialogOpened,
  dialogClosed: organizationDialogClosed,
} = organizationsSlice.actions;

export const organizationsReducer = organizationsSlice.reducer;
