"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Popover } from "@base-ui/react/popover";
import { Smile, Loader2 } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";
import { EmojiStyle, Theme } from "emoji-picker-react";

const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[342px] w-[306px] items-center justify-center bg-transparent">
      <Loader2 className="size-6 animate-spin text-muted-foreground/60" />
    </div>
  ),
});

interface Props {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

const nordPickerStyle = {
  "--epr-bg-color": "transparent",
  "--epr-dark-bg-color": "transparent",
  "--epr-text-color": "var(--muted-foreground)",
  "--epr-dark-text-color": "var(--muted-foreground)",
  "--epr-highlight-color": "var(--primary)",
  "--epr-dark-highlight-color": "var(--primary)",
  "--epr-hover-bg-color":
    "color-mix(in srgb, var(--foreground) 8%, transparent)",
  "--epr-dark-hover-bg-color":
    "color-mix(in srgb, var(--foreground) 8%, transparent)",
  "--epr-hover-bg-color-reduced-opacity":
    "color-mix(in srgb, var(--foreground) 6%, transparent)",
  "--epr-dark-hover-bg-color-reduced-opacity":
    "color-mix(in srgb, var(--foreground) 6%, transparent)",
  "--epr-focus-bg-color":
    "color-mix(in srgb, var(--foreground) 12%, transparent)",
  "--epr-dark-focus-bg-color":
    "color-mix(in srgb, var(--foreground) 12%, transparent)",
  "--epr-search-input-bg-color":
    "color-mix(in srgb, var(--background) 50%, transparent)",
  "--epr-dark-search-input-bg-color":
    "color-mix(in srgb, var(--background) 50%, transparent)",
  "--epr-search-input-bg-color-active":
    "color-mix(in srgb, var(--background) 50%, transparent)",
  "--epr-dark-search-input-bg-color-active":
    "color-mix(in srgb, var(--background) 50%, transparent)",
  "--epr-search-input-text-color": "var(--foreground)",
  "--epr-search-input-placeholder-color":
    "color-mix(in srgb, var(--nord4) 62%, var(--nord3))",
  "--epr-search-border-color":
    "color-mix(in srgb, var(--border) 80%, transparent)",
  "--epr-search-border-color-active": "var(--primary)",
  "--epr-category-label-bg-color":
    "color-mix(in srgb, var(--background) 82%, var(--card))",
  "--epr-dark-category-label-bg-color":
    "color-mix(in srgb, var(--background) 82%, var(--card))",
  "--epr-category-label-text-color": "var(--muted-foreground)",
  "--epr-category-icon-active-color": "var(--primary)",
  "--epr-dark-category-icon-active-color": "var(--primary)",
  "--epr-category-icon-inactive-color": "var(--nord4)",
  "--epr-dark-category-icon-inactive-color": "var(--nord4)",
  "--epr-picker-border-color": "transparent",
  "--epr-dark-picker-border-color": "transparent",
  "--epr-emoji-variation-picker-bg-color":
    "color-mix(in srgb, var(--background) 88%, var(--card))",
  "--epr-dark-emoji-variation-picker-bg-color":
    "color-mix(in srgb, var(--background) 88%, var(--card))",
  "--epr-emoji-variation-indicator-color": "var(--nord3)",
  "--epr-dark-emoji-variation-indicator-color": "var(--nord3)",
  "--epr-skin-tone-picker-menu-color":
    "color-mix(in srgb, var(--background) 88%, var(--card))",
  "--epr-dark-skin-tone-picker-menu-color":
    "color-mix(in srgb, var(--background) 88%, var(--card))",
  "--epr-skin-tone-outer-border-color": "var(--nord3)",
  "--epr-dark-skin-tone-outer-border-color": "var(--nord3)",
  "--epr-reactions-bg-color": "transparent",
  "--epr-dark-reactions-bg-color": "transparent",
  "--epr-dark": "var(--nord0)",
  "--epr-font-family": "var(--font-mono), ui-monospace, monospace",
  "--epr-emoji-size": "28px",
  "--epr-category-label-height": "28px",
  "--epr-category-label-padding": "0 10px",
  "--epr-header-padding": "10px 10px 6px 10px",
  "--epr-horizontal-padding": "10px",
  "--epr-search-input-height": "34px",
  "--epr-search-input-padding": "0 10px",
  "--epr-search-input-border-radius": "10px",
} as React.CSSProperties;

export function EmojiPicker({ onSelectEmoji, disabled }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        type="button"
        disabled={disabled}
        aria-label="Insert emoji"
        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground/75 transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      >
        <Smile className="size-4" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="top" align="end" sideOffset={6}>
          <Popover.Popup
            finalFocus={false}
            className="pleck-emoji-picker z-50 w-[306px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border/90 bg-card/20 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl focus:outline-none"
          >
            <style>{`
							.pleck-emoji-picker [data-epr-part="category-label"],
							.pleck-emoji-picker .epr-category-label-appearance,
							.pleck-emoji-picker .epr-emoji-category-label {
								font-size: 0.85rem !important;
								font-weight: 400 !important;
								letter-spacing: 0.01em !important;
								color: var(--muted-foreground) !important;
								font-family: var(--font-mono), ui-monospace, monospace !important;
							}
							.pleck-emoji-picker [data-epr-part="emoji"],
							.pleck-emoji-picker [data-epr-part="emoji"] * {
								font-size: var(--epr-emoji-size, 28px) !important;
							}
							.pleck-emoji-picker input,
							.pleck-emoji-picker input::placeholder {
								font-size: 0.85rem !important;
								font-weight: 400 !important;
								font-family: var(--font-mono), ui-monospace, monospace !important;
							}
						`}</style>
            <Picker
              onEmojiClick={(emojiData: EmojiClickData) => {
                onSelectEmoji(emojiData.emoji);
                setOpen(false);
              }}
              autoFocusSearch={false}
              emojiStyle={EmojiStyle.NATIVE}
              theme={Theme.DARK}
              style={nordPickerStyle}
              width="100%"
              height={342}
              lazyLoadEmojis
              searchPlaceHolder="Search emojis…"
              previewConfig={{ showPreview: false }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
