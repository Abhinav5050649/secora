import { Badge } from "@/components/base/badges/badges";
import type { IdentityStatus } from "@/types/resources";

const COLOR: Record<IdentityStatus, "gray" | "warning" | "success"> = {
  created: "gray",
  pending: "warning",
  active: "success",
};

export function IdentityStatusBadge({ status }: { status: IdentityStatus }) {
  return (
    <Badge size="sm" color={COLOR[status]} className="capitalize">
      {status}
    </Badge>
  );
}
