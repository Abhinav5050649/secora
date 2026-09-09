"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Monitor01, Moon01, Sun } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";

const ORDER = ["light", "dark", "system"] as const;
const ICONS = { light: Sun, dark: Moon01, system: Monitor01 } as const;
const LABELS = { light: "Light theme", dark: "Dark theme", system: "System theme" } as const;

/** Cycles light -> dark -> system on click. Renders a stable placeholder until mounted to avoid an SSR/client icon mismatch. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // next-themes' documented pattern for avoiding an SSR/client mismatch:
    // `theme` is only meaningful after the client has hydrated and read the
    // class next-themes' inline script already set on <html>.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const current = mounted ? ((theme as (typeof ORDER)[number]) ?? "system") : "system";
  const Icon = ICONS[current];

  const handleClick = () => {
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setTheme(next);
  };

  return <ButtonUtility onClick={handleClick} icon={Icon} tooltip={LABELS[current]} size="sm" color="tertiary" />;
}
