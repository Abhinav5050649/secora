"use client";

import { useRouter } from "next/navigation";
import { Button as AriaButton } from "react-aria-components";
import { LogOut01, User01 } from "@untitledui/icons";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Avatar } from "@/components/base/avatar/avatar";
import { useGetMeQuery } from "@/features/session";
import { useSignoutMutation } from "@/features/auth";
import { apiSlice } from "@/lib/redux/api/apiSlice";
import { useAppDispatch } from "@/lib/redux/hooks";

function initials(firstName?: string | null, lastName?: string | null) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

export function UserMenu() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: user } = useGetMeQuery();
  const [signout] = useSignoutMutation();

  const handleSignOut = async () => {
    await signout();
    // Clears every cached query (org list, campaigns, ...) so the next
    // sign-in doesn't briefly show the previous user's stale data.
    dispatch(apiSlice.util.resetApiState());
    router.push("/login");
  };

  return (
    <Dropdown.Root>
      <AriaButton className="flex cursor-pointer items-center gap-2 rounded-lg p-1 outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2">
        <Avatar size="sm" initials={initials(user?.first_name, user?.last_name)} />
      </AriaButton>

      <Dropdown.Popover placement="bottom right" className="w-56">
        <Dropdown.Menu
          onAction={(key) => {
            if (key === "sign-out") handleSignOut();
            if (key === "profile") router.push("/profile");
          }}
        >
          <Dropdown.Item id="profile" label="Profile" icon={User01} />
          <Dropdown.Separator />
          <Dropdown.Item id="sign-out" label="Sign out" icon={LogOut01} />
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  );
}
