"use client";

import { ArrowLeft, ArrowRight } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { NativeSelect } from "@/components/base/select/select-native";

interface LimitOffsetPaginationProps {
  limit: number;
  offset: number;
  rowCount: number;
  onLimitChange: (limit: number) => void;
  onOffsetChange: (offset: number) => void;
}

const PAGE_SIZE_OPTIONS = [
  { label: "10 per page", value: "10" },
  { label: "25 per page", value: "25" },
  { label: "50 per page", value: "50" },
];

/**
 * bun/api's list endpoints return a raw array with no total count, so "has
 * next page" is inferred client-side from `rowCount === limit` rather than
 * a real page-number/total display.
 */
export function LimitOffsetPagination({
  limit,
  offset,
  rowCount,
  onLimitChange,
  onOffsetChange,
}: LimitOffsetPaginationProps) {
  const hasPrev = offset > 0;
  const hasNext = rowCount === limit;

  return (
    <div className="mt-4 flex items-center justify-end gap-3">
      <NativeSelect
        className="w-40"
        size="sm"
        options={PAGE_SIZE_OPTIONS}
        value={String(limit)}
        onChange={(e) => {
          onLimitChange(Number(e.target.value));
          onOffsetChange(0);
        }}
      />
      <Button size="sm" color="secondary" iconLeading={ArrowLeft} isDisabled={!hasPrev} onClick={() => onOffsetChange(Math.max(0, offset - limit))}>
        Prev
      </Button>
      <Button size="sm" color="secondary" iconTrailing={ArrowRight} isDisabled={!hasNext} onClick={() => onOffsetChange(offset + limit)}>
        Next
      </Button>
    </div>
  );
}
