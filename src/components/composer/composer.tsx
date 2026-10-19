"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MAX_TEXT_LENGTH } from "@/lib/media-types";

type SparkKind = "text" | "photo";

export function Composer({ circleId }: { circleId: number }) {
  const router = useRouter();
  const [kind, setKind] = useState<SparkKind>("text");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitting = status !== null;
  const canSubmit = false;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    try {
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] space-y-4">
        {/* Segmented control type switch */}
        <Tabs
          value={kind}
          onValueChange={(v) => setKind(v as SparkKind)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/80 rounded-xl border border-border/40 group-data-horizontal/tabs:h-auto h-auto">
            <TabsTrigger
              value="text"
              className="h-auto py-1.5 px-3 flex items-center justify-center gap-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer data-active:bg-background data-active:text-foreground data-active:shadow-xs"
            >
              <Type className="size-4 shrink-0" />
              <span className="leading-none">Text</span>
            </TabsTrigger>
            <TabsTrigger
              value="photo"
              className="h-auto py-1.5 px-3 flex items-center justify-center gap-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer data-active:bg-background data-active:text-foreground data-active:shadow-xs"
            >
              <Camera className="size-4 shrink-0" />
              <span className="leading-none">Photo</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* PLK-31: photo picker + preview renders here when kind === "photo" */}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="caption"
              className="text-xs sm:text-sm font-medium text-foreground/85"
            >
              {kind === "text" ? "What happened?" : "Caption (optional)"}
            </Label>
            <span className="text-[0.7rem] sm:text-xs tabular-nums text-muted-foreground/80">
              {caption.length}/{MAX_TEXT_LENGTH}
            </span>
          </div>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={MAX_TEXT_LENGTH}
            rows={kind === "text" ? 6 : 3}
            disabled={submitting}
            placeholder={
              kind === "text"
                ? "Write a memory, moment, or quick thought…"
                : "Add a caption…"
            }
            className="min-h-[140px] resize-none rounded-xl border-border/80 bg-background/50 p-3 text-sm leading-relaxed transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-1"
          />
        </div>

        {error && (
          <div
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs sm:text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      {/* Sticky bottom bar on mobile, in-flow on desktop */}
      <div className="sticky bottom-0 -mx-4 -mb-6 mt-2 border-t border-border/50 bg-background/90 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mb-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button
          type="submit"
          className="w-full h-10 rounded-xl font-medium shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>{status}</span>
            </span>
          ) : (
            (status ?? "Post spark")
          )}
        </Button>
      </div>
    </form>
  );
}
