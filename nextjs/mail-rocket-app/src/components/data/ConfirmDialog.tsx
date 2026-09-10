"use client";

import type { ReactNode } from "react";
import { ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
}

/** Shared confirmation dialog for every resource's delete flow (and any other destructive action). */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  isDestructive = true,
  isLoading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
      <Modal className="max-w-md">
        <Dialog className="flex-col items-start gap-4 rounded-xl bg-primary p-6 shadow-xl ring-1 ring-secondary">
          <div className="flex flex-col gap-1">
            <h2 className="text-md font-semibold text-primary">{title}</h2>
            <div className="text-sm text-tertiary">{description}</div>
          </div>
          <div className="flex w-full justify-end gap-3">
            <Button type="button" color="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" color={isDestructive ? "primary-destructive" : "primary"} isLoading={isLoading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
