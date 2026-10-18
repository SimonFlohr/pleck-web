import type { FeedItem } from "@/lib/feed/types";
import { formatStamp, type Reader } from "@/lib/format";
import { Camera, Mic } from "lucide-react";

export function SparkCard({
  item,
  reader,
}: {
  item: FeedItem;
  reader: Reader;
}) {
  return (
    <article className="rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] transition-colors hover:border-border">
      <header className="mb-2 flex items-baseline justify-between gap-2 text-xs sm:text-sm">
        <span className="font-medium tracking-tight text-foreground/90">
          {item.authorName}
        </span>
        <time
          dateTime={item.createdAt}
          className="text-xs text-muted-foreground/75 font-normal tabular-nums"
          suppressHydrationWarning
        >
          {formatStamp(item.createdAt, item.authorTimezone, reader)}
        </time>
      </header>

      {item.type === "photo" &&
        (item.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.mediaUrl}
            alt={item.textContent ?? `Photo by ${item.authorName}`}
            loading="lazy"
            className="mb-2 w-full max-h-[520px] rounded-lg object-cover"
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
