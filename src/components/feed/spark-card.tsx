import type { FeedItem } from "@/lib/feed/types";
import { formatStamp, type Reader } from "@/lib/format";
import { Camera, Mic, Loader2, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { deleteSpark } from "@/lib/sparks/client";

export function SparkCard({
  item,
  reader,
  currentMember,
  onDelete,
}: {
  item: FeedItem;
  reader: Reader;
  currentMember: { id: number; role: "owner" | "member" };
  onDelete: (id: number) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete =
    currentMember.id === item.authorMemberId || currentMember.role === "owner";

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
    <article className="rounded-xl border border-border/90 bg-card/20 backdrop-blur-xl p-3.5 sm:p-4 shadow-[0_10px_15px_-10px_rgba(0,0,0,0.2)] transition-colors hover:border-primary/45">
      <header className="mb-2 flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 min-w-0">
          {item.authorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.authorAvatarUrl}
              alt=""
              className="size-5 sm:size-6 rounded-full object-cover shrink-0 border border-border/40"
            />
          ) : (
            <div className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-muted border border-border/40 text-[0.6rem] sm:text-[0.65rem] font-medium text-muted-foreground uppercase shrink-0">
              {item.authorName.charAt(0)}
            </div>
          )}
          <span className="font-bold tracking-tight text-foreground/90 truncate">
            {item.authorName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <time
            dateTime={item.createdAt}
            className="text-xs text-muted-foreground/75 font-normal tabular-nums"
            suppressHydrationWarning
          >
            {formatStamp(item.createdAt, item.authorTimezone, reader)}
          </time>
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

      {item.type === "photo" &&
        (item.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.mediaUrl}
            alt={item.textContent ?? `Photo by ${item.authorName}`}
            loading="lazy"
            decoding="async"
            className="mb-2 w-full max-h-[520px] rounded-lg object-cover bg-muted/40"
          />
        ) : (
          <div className="mb-2 flex aspect-video sm:aspect-16/10 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            <Camera className="size-5 text-muted-foreground/60 stroke-[1.5]" />
            <span>Photo unavailable</span>
          </div>
        ))}

      {item.type === "voice" && (
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
      )}

      {item.textContent && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-normal">
          {item.textContent}
        </p>
      )}
    </article>
  );
}
