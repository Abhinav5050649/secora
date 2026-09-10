"use client";

import type { HTMLAttributes } from "react";
import { Rocket01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export const MailRocketLogo = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props} className={cx("flex h-8 w-max items-center gap-2", props.className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-white">
        <Rocket01 className="size-4.5" />
      </span>
      <span className="text-md font-semibold text-primary">Mail Rocket</span>
    </div>
  );
};
