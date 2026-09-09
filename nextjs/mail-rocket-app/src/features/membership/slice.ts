import { createListFeatureSlice } from "@/lib/redux/createListFeatureSlice";
import type { MembershipFilters } from "./model";

const membershipSlice = createListFeatureSlice<MembershipFilters>("membership", {});

export const {
  filtersChanged: membershipFiltersChanged,
  filtersCleared: membershipFiltersCleared,
  createDialogOpened: membershipCreateDialogOpened,
  editDialogOpened: membershipEditDialogOpened,
  deleteDialogOpened: membershipDeleteDialogOpened,
  dialogClosed: membershipDialogClosed,
} = membershipSlice.actions;

export const membershipReducer = membershipSlice.reducer;
