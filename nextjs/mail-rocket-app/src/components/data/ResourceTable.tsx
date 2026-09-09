"use client";

import * as React from "react";
import { SearchLg } from "@untitledui/icons";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { getApiErrorMessage } from "@/lib/redux/api/errors";
import { cx } from "@/utils/cx";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export interface ResourceTableColumn<Row> {
  header: string;
  render: (row: Row) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface ResourceTableProps<Row extends { id: string }> {
  rows: Row[] | undefined;
  columns: ResourceTableColumn<Row>[];
  loading: boolean;
  error?: FetchBaseQueryError | SerializedError;
  onRowClick?: (row: Row) => void;
  /** Card body for the below-`md` layout; falls back to stacking every column's render output. */
  renderMobileCard?: (row: Row) => React.ReactNode;
  emptyMessage?: string;
}

/**
 * Generic list surface: a table at `md`+ and a stack of cards below it, so
 * every resource's list page shares one responsive implementation instead of
 * maintaining separate desktop/mobile views. Uses plain semantic table
 * markup styled with Untitled UI's card/table tokens rather than the full
 * react-aria-components Table collection API, since that API expects each
 * page to declare its own typed column collection - this generic wrapper
 * would fight that model across nine different resource shapes.
 */
export function ResourceTable<Row extends { id: string }>({
  rows,
  columns,
  loading,
  error,
  onRowClick,
  renderMobileCard,
  emptyMessage = "Nothing here yet.",
}: ResourceTableProps<Row>) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingIndicator size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-error-primary px-4 py-3 text-sm text-error-primary ring-1 ring-error_subtle">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl bg-primary py-12 ring-1 ring-secondary">
        <EmptyState size="sm">
          <EmptyState.FeaturedIcon icon={SearchLg} color="gray" theme="modern" />
          <EmptyState.Content>
            <EmptyState.Title>{emptyMessage}</EmptyState.Title>
          </EmptyState.Content>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      {/* Cards below md */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            disabled={!onRowClick}
            onClick={() => onRowClick?.(row)}
            className={cx(
              "w-full rounded-xl bg-primary p-4 text-left ring-1 ring-secondary transition duration-100 ease-linear",
              onRowClick && "cursor-pointer hover:bg-secondary",
            )}
          >
            {renderMobileCard ? (
              renderMobileCard(row)
            ) : (
              <div className="flex flex-col gap-1.5">
                {columns.map((col) => (
                  <div key={col.header} className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-tertiary">{col.header}</span>
                    <span className="text-sm text-secondary">{col.render(row)}</span>
                  </div>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Table at md+ */}
      <div className="hidden overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className={cx(
                      "h-11 px-6 text-left text-xs font-semibold whitespace-nowrap text-quaternary",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cx(
                    "border-t border-secondary transition-colors",
                    onRowClick && "cursor-pointer hover:bg-secondary",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={cx(
                        "px-6 py-4 text-sm text-tertiary",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
