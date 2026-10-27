"use client";

import type { FeedItem } from "@/lib/feed/types";
import { formatStamp, type Reader } from "@/lib/format";
import { Dialog } from "@base-ui/react/dialog";
import { Camera, Mic, Loader2, Trash2, Undo2, X } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { deleteSpark } from "@/lib/sparks/client";

const previewTextClass =
  "line-clamp-3 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed font-normal text-foreground/90";

const openButtonClass =
  "cursor-pointer rounded-md border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SparkCard({
  item,
  reader,
  currentMember,
  onDelete,
  motionClass,
  motionDelay = 0,
}: {
  item: FeedItem;
  reader: Reader;
  currentMember: { id: number; role: "owner" | "member" };
  onDelete: (id: number) => void;
  motionClass?: string;
  motionDelay?: number;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete =
    currentMember.id === item.authorMemberId || currentMember.role === "owner";
  const [enterDelay] = useState(motionDelay);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteSpark(item.id);
      onDelete(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete spark");
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <article
      className={`rounded-xl border border-border/90 bg-card/20 backdrop-blur-xl p-3.5 sm:p-4 shadow-[0_10px_15px_-10px_rgba(0,0,0,0.2)] transition-colors hover:border-primary/45 ${motionClass ?? ""}`}
      style={motionClass ? { animationDelay: `${enterDelay}ms` } : undefined}
    >
      <header className="mb-2 flex items-center justify-between gap-2 text-xs sm:text-sm">
        <AuthorLockup item={item} />
        <div className="flex items-center gap-2">
          <SparkTime item={item} reader={reader} />
          {canDelete && (
            <div className="relative">
              {showConfirm ? (
                <div className="flex items-center gap-2.5 bg-muted/90 rounded-lg px-2 py-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="text-[0.8rem] font-medium text-destructive hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3 animate-spin inline" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="flex  gap-1 text-[0.8rem] text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                    <Undo2 className="size-3 mt-[0.2rem]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  aria-label="Delete spark"
                  className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {error && <p className="mb-2 text-xs text-destructive">{error}</p>}

      {item.type === "photo" && <PhotoPreview item={item} reader={reader} />}

      {item.type === "voice" && (
        <>
          <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background border border-border/60">
              <Mic className="size-3 text-foreground/70 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground/80">Voice note</p>
              <p className="text-[0.7rem] text-muted-foreground/80">
                Playback coming soon
              </p>
            </div>
          </div>
          {item.textContent && (
            <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 font-normal">
              {item.textContent}
            </p>
          )}
        </>
      )}

      {item.type === "text" && item.textContent && (
        <TextPreview item={item} reader={reader} />
      )}
    </article>
  );
}

function PhotoPreview({ item, reader }: { item: FeedItem; reader: Reader }) {
  return (
    <SparkDialog item={item} reader={reader}>
      <Dialog.Trigger
        type="button"
        className={`${openButtonClass} flex w-full items-center gap-3`}
      >
        <PhotoThumb item={item} />
        <span className="sr-only">
          {item.mediaUrl
            ? item.textContent
              ? "View photo"
              : `View photo by ${item.authorName}`
            : "Photo unavailable"}
        </span>
        {item.textContent && (
          <span className={`${previewTextClass} min-w-0 flex-1`}>
            {item.textContent}
          </span>
        )}
      </Dialog.Trigger>
    </SparkDialog>
  );
}

function PhotoThumb({ item }: { item: FeedItem }) {
  if (item.mediaUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.mediaUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-16 shrink-0 rounded-md bg-muted/40 object-cover sm:size-[4.5rem]"
      />
    );
  }

  return (
    <span className="flex size-16 shrink-0 flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/30 text-muted-foreground sm:size-[4.5rem]">
      <Camera className="size-4 stroke-[1.5]" />
    </span>
  );
}

function TextPreview({ item, reader }: { item: FeedItem; reader: Reader }) {
  const text = item.textContent ?? "";
  const [open, setOpen] = useState(false);
  const { ref, overflows } = useTextOverflow(text);

  return (
    <SparkDialog
      item={item}
      reader={reader}
      open={open}
      onOpenChange={setOpen}
      finalFocus={ref}
    >
      <p
        ref={ref}
        className={
          overflows
            ? `${previewTextClass} cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
            : previewTextClass
        }
        role={overflows ? "button" : undefined}
        tabIndex={overflows ? 0 : undefined}
        aria-haspopup={overflows ? "dialog" : undefined}
        aria-expanded={overflows ? open : undefined}
        onClick={overflows ? () => setOpen(true) : undefined}
        onKeyDown={
          overflows
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setOpen(true);
                }
              }
            : undefined
        }
      >
        {text}
      </p>
    </SparkDialog>
  );
}

function SparkDialog({
  item,
  reader,
  children,
  open,
  onOpenChange,
  finalFocus,
}: {
  item: FeedItem;
  reader: Reader;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  finalFocus?: React.RefObject<HTMLElement | null>;
}) {
  const caption = item.textContent?.trim() ? item.textContent : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full justify-center p-4 sm:p-6">
            <Dialog.Popup
              finalFocus={finalFocus}
              className="my-auto flex max-h-[90vh] w-full max-w-xl flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-border/90 bg-popover p-4 text-foreground shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)] outline-none transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 sm:p-5"
            >
              <header className="flex items-center justify-between gap-3">
                <AuthorLockup item={item} title />
                <div className="flex shrink-0 items-center gap-2">
                  <SparkTime item={item} reader={reader} />
                  <Dialog.Close
                    aria-label="Close"
                    className="cursor-pointer rounded-md p-1 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </div>
              </header>

              {item.type === "photo" &&
                (item.mediaUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.mediaUrl}
                    alt={caption ? "" : `Photo by ${item.authorName}`}
                    className="max-h-[70vh] w-full rounded-lg bg-muted/40 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                    <Camera className="size-5 stroke-[1.5]" />
                    <span>Photo unavailable</span>
                  </div>
                ))}

              <Dialog.Description
                className={
                  caption
                    ? "whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground"
                    : "sr-only"
                }
              >
                {caption ?? `Photo by ${item.authorName}`}
              </Dialog.Description>
            </Dialog.Popup>
          </div>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AuthorLockup({ item, title }: { item: FeedItem; title?: boolean }) {
  const name = title ? (
    <Dialog.Title className="truncate text-xs font-bold tracking-tight text-foreground sm:text-sm">
      {item.authorName}
    </Dialog.Title>
  ) : (
    <span className="truncate font-bold tracking-tight text-foreground/90">
      {item.authorName}
    </span>
  );

  return (
    <div className="flex min-w-0 items-center gap-2">
      {item.authorAvatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.authorAvatarUrl}
          alt=""
          className="size-5 shrink-0 rounded-full border border-border/40 object-cover sm:size-6"
        />
      ) : (
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted text-[0.6rem] font-medium text-muted-foreground uppercase sm:size-6 sm:text-[0.65rem]">
          {item.authorName.charAt(0)}
        </div>
      )}
      {name}
    </div>
  );
}

function SparkTime({ item, reader }: { item: FeedItem; reader: Reader }) {
  return (
    <time
      dateTime={item.createdAt}
      className="font-mono text-xs font-normal whitespace-nowrap text-muted-foreground/75"
      suppressHydrationWarning
    >
      {formatStamp(item.createdAt, item.authorTimezone, reader)}
    </time>
  );
}

function useTextOverflow(text: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => {
      const next = contentOverflows(node);
      setOverflows((prev) => (prev === next ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [text]);

  return { ref, overflows };
}

function contentOverflows(el: HTMLElement) {
  if (el.clientWidth === 0) return false;
  if (el.scrollHeight > el.clientHeight + 1) return true;

  const clone = el.cloneNode(true) as HTMLElement;
  const style = getComputedStyle(el);
  clone.setAttribute("aria-hidden", "true");
  clone.style.position = "fixed";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.visibility = "hidden";
  clone.style.pointerEvents = "none";
  clone.style.width = `${el.clientWidth}px`;
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  clone.style.display = "block";
  clone.style.whiteSpace = style.whiteSpace;
  clone.style.setProperty("-webkit-line-clamp", "unset");
  clone.style.setProperty("line-clamp", "unset");
  document.body.appendChild(clone);
  try {
    return clone.getBoundingClientRect().height > el.clientHeight + 1;
  } finally {
    clone.remove();
  }
}
