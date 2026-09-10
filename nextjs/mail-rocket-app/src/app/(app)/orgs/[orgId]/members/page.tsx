"use client";

import { use } from "react";
import { Plus, Trash01 } from "@untitledui/icons";
import { ResourceTable } from "@/components/data/ResourceTable";
import { LimitOffsetPagination } from "@/components/data/LimitOffsetPagination";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { RequireRole } from "@/components/auth/RequireRole";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { NativeSelect } from "@/components/base/select/select-native";
import { usePaginationParams } from "@/hooks/usePaginationParams";
import { useCurrentOrgRole, ROLE_RANK } from "@/hooks/useCurrentOrgRole";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useGetMeQuery } from "@/features/session";
import {
  useGetMembersQuery,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  selectMembershipDialog,
  membershipDeleteDialogOpened,
  membershipDialogClosed,
} from "@/features/membership";
import type { OrganizationUserRole } from "@/types/resources";

const ALL_ROLE_OPTIONS = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Admin", value: "admin" },
  { label: "Owner", value: "owner" },
];

export default function MembersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const dispatch = useAppDispatch();
  const dialog = useAppSelector(selectMembershipDialog);
  const { limit, offset, setLimit, setOffset } = usePaginationParams();
  const { data: members, isLoading, error } = useGetMembersQuery({ organizationId: orgId, limit, offset });
  const [updateMember] = useUpdateMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();
  const { data: me } = useGetMeQuery();
  const { role: currentRole } = useCurrentOrgRole();
  // Mirrors the backend's `update` rule: nobody can change their own role,
  // and only an owner can change another owner's role - any admin+ can
  // freely change everyone else's (including another admin's).
  const canChangeRole = (m: { user_id: string; role: OrganizationUserRole }) => m.user_id !== me?.id && (m.role !== "owner" || currentRole === "owner");
  // And a role can never be assigned above the caller's own rank.
  const roleOptionsFor = (m: { user_id: string; role: OrganizationUserRole }) =>
    canChangeRole(m) ? ALL_ROLE_OPTIONS.filter((option) => !currentRole || ROLE_RANK[option.value as OrganizationUserRole] <= ROLE_RANK[currentRole]) : ALL_ROLE_OPTIONS;
  // Mirrors the backend's `delete` rule: a caller may only remove a member
  // ranked strictly below them, which also rules out removing themselves.
  const canRemove = (m: { user_id: string; role: OrganizationUserRole }) => m.user_id !== me?.id && (!currentRole || ROLE_RANK[currentRole] > ROLE_RANK[m.role]);

  const target = dialog?.type === "delete" ? members?.find((m) => m.user_id === dialog.id) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Members</h1>
        <RequireRole atLeast="admin">
          <Button href={`/orgs/${orgId}/members/new`} iconLeading={Plus}>
            Add member
          </Button>
        </RequireRole>
      </div>

      <ResourceTable
        rows={members}
        loading={isLoading}
        error={error}
        columns={[
          { header: "Name", render: (m) => `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "—" },
          {
            header: "Role",
            render: (m) => (
              <RequireRole atLeast="admin" mode="disable">
                <NativeSelect
                  size="sm"
                  className="w-32"
                  options={roleOptionsFor(m)}
                  value={m.role}
                  disabled={!canChangeRole(m)}
                  onChange={(e) =>
                    updateMember({ organizationId: orgId, userId: m.user_id, role: e.target.value as OrganizationUserRole })
                  }
                />
              </RequireRole>
            ),
          },
          {
            header: "",
            align: "right",
            render: (m) =>
              canRemove(m) && (
                <RequireRole atLeast="admin">
                  <ButtonUtility icon={Trash01} size="sm" color="tertiary" tooltip="Remove" onClick={() => dispatch(membershipDeleteDialogOpened(m.user_id))} />
                </RequireRole>
              ),
          },
        ]}
      />

      <LimitOffsetPagination limit={limit} offset={offset} rowCount={members?.length ?? 0} onLimitChange={setLimit} onOffsetChange={setOffset} />

      <ConfirmDialog
        isOpen={dialog?.type === "delete"}
        onOpenChange={(open) => !open && dispatch(membershipDialogClosed())}
        title={`Remove ${target ? `${target.first_name ?? ""} ${target.last_name ?? ""}`.trim() || "this member" : "this member"} from the organization?`}
        description="They will lose access to this organization immediately."
        isLoading={isRemoving}
        onConfirm={async () => {
          if (dialog?.type === "delete") {
            await removeMember({ organizationId: orgId, userId: dialog.id });
            dispatch(membershipDialogClosed());
          }
        }}
      />
    </div>
  );
}
