"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_PAGE_SIZE } from "@/types/resources";

/** Syncs `limit`/`offset` list state to the URL so pagination survives a refresh/back-navigation. */
export function usePaginationParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const limit = Number(searchParams.get("limit")) || DEFAULT_PAGE_SIZE;
  const offset = Number(searchParams.get("offset")) || 0;

  const update = React.useCallback(
    (next: { limit?: number; offset?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.limit !== undefined) params.set("limit", String(next.limit));
      if (next.offset !== undefined) params.set("offset", String(next.offset));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return {
    limit,
    offset,
    setLimit: (value: number) => update({ limit: value }),
    setOffset: (value: number) => update({ offset: value }),
  };
}
