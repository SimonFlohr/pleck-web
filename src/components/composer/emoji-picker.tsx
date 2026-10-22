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
    <div className="flex h-[342px] w-[306px] items-center justify-center bg-card">
      <Loader2 className="size-6 animate-spin text-muted-foreground/60" />
    </div>
  ),
});

interface Props {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

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
            style={
              {
                "--epr-font-family": "var(--font-sans), system-ui, sans-serif",
                "--epr-emoji-size": "28px",
                "--epr-category-label-height": "28px",
                "--epr-category-label-padding": "0 10px",
                "--epr-header-padding": "10px 10px 6px 10px",
                "--epr-horizontal-padding": "10px",
                "--epr-search-input-height": "34px",
                "--epr-search-input-padding": "0 10px",
                "--epr-search-input-border-radius": "10px",
                "--epr-picker-border-color": "transparent",
                "--epr-bg-color": "transparent",
              } as React.CSSProperties
            }
            className="pleck-emoji-picker z-50 overflow-hidden rounded-md border border-border/80 bg-card shadow-xl focus:outline-none w-[306px] max-w-[calc(100vw-2rem)]"
          >
            <style>{`
							.pleck-emoji-picker [data-epr-part="category-label"],
							.pleck-emoji-picker .epr-category-label-appearance,
							.pleck-emoji-picker .epr-emoji-category-label {
								font-size: 0.85rem !important;
								font-weight: 400 !important;
								letter-spacing: 0.01em !important;
								color: var(--muted-foreground) !important;
								font-family: var(--font-sans), system-ui, sans-serif !important;
							}
							.pleck-emoji-picker [data-epr-part="emoji"],
							.pleck-emoji-picker [data-epr-part="emoji"] * {
								font-size: var(--epr-emoji-size, 28px) !important;
							}
							.pleck-emoji-picker input,
							.pleck-emoji-picker input::placeholder {
								font-size: 0.85rem !important;
								font-weight: 400 !important;
								font-family: var(--font-sans), system-ui, sans-serif !important;
							}
						`}</style>
            <Picker
              onEmojiClick={(emojiData: EmojiClickData) => {
                onSelectEmoji(emojiData.emoji);
                setOpen(false);
              }}
              autoFocusSearch={false}
              emojiStyle={EmojiStyle.NATIVE}
              theme={Theme.AUTO}
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
