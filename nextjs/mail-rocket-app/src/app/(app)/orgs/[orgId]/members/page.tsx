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
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  useGetMembersQuery,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  selectMembershipDialog,
  membershipDeleteDialogOpened,
  membershipDialogClosed,
} from "@/features/membership";
import type { OrganizationUserRole } from "@/types/resources";

const ROLE_OPTIONS = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Admin", value: "admin" },
];

export default function MembersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const dispatch = useAppDispatch();
  const dialog = useAppSelector(selectMembershipDialog);
  const { limit, offset, setLimit, setOffset } = usePaginationParams();
  const { data: members, isLoading, error } = useGetMembersQuery({ organizationId: orgId, limit, offset });
  const [updateMember] = useUpdateMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

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
                  options={ROLE_OPTIONS}
                  value={m.role}
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
            render: (m) => (
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
