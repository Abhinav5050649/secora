"use client";

import * as React from "react";
import { Code01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Label } from "@/components/base/input/label";
import { TEMPLATE_VARIABLES } from "@/lib/constants/templateVariables";
import { cx } from "@/utils/cx";

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A plain native `<textarea>` (not the react-aria-components `TextArea`) so
 * the "insert variable" picker can read/set `selectionStart` directly - RAC's
 * wrapper doesn't expose the raw DOM node cleanly for cursor manipulation.
 */
export function TemplateEditor({ value, onChange }: TemplateEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertVariable = (token: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}{{${token}}}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      const cursor = start + token.length + 4;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>HTML body</Label>
        <Dropdown.Root>
          <AriaButton className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-brand-secondary outline-focus-ring hover:bg-primary_hover">
            <Code01 className="size-3.5" />
            Insert variable
          </AriaButton>
          <Dropdown.Popover className="w-80">
            <Dropdown.Menu onAction={(key) => insertVariable(String(key))}>
              {TEMPLATE_VARIABLES.map((v) => (
                <Dropdown.Item key={v.token} id={v.token} label={`{{${v.token}}}`} addon={v.description} unstyled={false} />
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown.Root>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className={cx(
          "w-full scroll-py-3 rounded-lg bg-primary px-3.5 py-3 font-mono text-sm text-primary shadow-xs ring-1 ring-primary transition duration-100 ease-linear ring-inset placeholder:text-placeholder focus:outline-hidden focus:ring-2 focus:ring-brand",
        )}
        placeholder="<html>...</html>"
      />
    </div>
  );
}
