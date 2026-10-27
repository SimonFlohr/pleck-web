"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageIcon, Loader2, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmojiPicker } from "./emoji-picker";
import {
  ALLOWED_TYPES,
  MAX_SIZE_BYTES,
  MAX_TEXT_LENGTH,
} from "@/lib/media-types";
import {
  optimizePhoto,
  readExifDateTime,
  sha256Hex,
  uploadToS3,
} from "@/lib/media/prepare-photo";
import { postSpark } from "@/lib/sparks/client";

type SparkKind = "text" | "photo";

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";

const photoActionClass =
  "cursor-pointer rounded-xl border-border/50 bg-background/40 text-foreground shadow-none hover:border-border/80 hover:bg-background/55";

export function Composer({ circleId }: { circleId: number }) {
  const router = useRouter();
  const [kind, setKind] = useState<SparkKind>("text");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submitting = status !== null;
  const canSubmit = kind === "text" ? caption.trim().length > 0 : file !== null;

  function handleSelectEmoji(emoji: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      if (caption.length + emoji.length <= MAX_TEXT_LENGTH) {
        setCaption((prev) => prev + emoji);
      }
      return;
    }

    const start = textarea.selectionStart ?? caption.length;
    const end = textarea.selectionEnd ?? caption.length;
    const newText = caption.slice(0, start) + emoji + caption.slice(end);

    if (newText.length <= MAX_TEXT_LENGTH) {
      setCaption(newText);
      const nextCursor = start + emoji.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(nextCursor, nextCursor);
      });
    }
  }

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError(null);

    if (
      picked &&
      (!ALLOWED_TYPES[picked.type] || !picked.type.startsWith("image/"))
    ) {
      setError("That file type isn't supported. Try a JPEG, PNG, or WebP.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (picked && picked.size > MAX_SIZE_BYTES) {
      setError("That photo is over 50 MB.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(picked);
    setPreviewUrl(picked ? URL.createObjectURL(picked) : null);
  }

  function handleClearPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    try {
      if (kind === "text") {
        setStatus("Posting…");
        await postSpark({ type: "text", textContent: caption });
      }
      if (kind === "photo" && file) {
        setStatus("Preparing…");
        const [exifDateTime, uploadFile] = await Promise.all([
          readExifDateTime(file), // Read EXIF from original before canvas strips it
          optimizePhoto(file),
        ]);
        const sha256 = await sha256Hex(uploadFile);

        setStatus("Uploading…");
        const key = await uploadToS3(uploadFile, circleId);

        setStatus("Saving…");
        await postSpark({
          type: "photo",
          textContent: caption.trim() || undefined,
          exifDateTime,
          media: {
            key,
            mime: uploadFile.type,
            sizeBytes: uploadFile.size,
            sha256,
            originalFilename: file.name,
          },
        });
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border/90 bg-card/20 backdrop-blur-xl p-4 sm:p-6 shadow-[0_10px_15px_-10px_rgba(0,0,0,0.2)] space-y-4">
        <Tabs
          value={kind}
          onValueChange={(v) => setKind(v as SparkKind)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 p-1 bg-background/40 rounded-xl border border-border/50 group-data-horizontal/tabs:h-auto h-auto">
            <TabsTrigger
              value="text"
              className="h-auto py-1.5 px-3 flex items-center justify-center gap-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer data-active:bg-card/20 data-active:text-foreground data-active:shadow-sm"
            >
              <Type className="size-4 shrink-0" />
              <span className="leading-none">Text</span>
            </TabsTrigger>
            <TabsTrigger
              value="photo"
              className="h-auto py-1.5 px-3 flex items-center justify-center gap-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer data-active:bg-card/20 data-active:text-foreground data-active:shadow-sm"
            >
              <Camera className="size-4 shrink-0" />
              <span className="leading-none">Photo</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {kind === "photo" && (
          <div className="space-y-3">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPickFile}
              className="sr-only"
              id="camera-input"
              disabled={submitting}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept={PHOTO_ACCEPT}
              onChange={onPickFile}
              className="sr-only"
              id="gallery-input"
              disabled={submitting}
            />

            {previewUrl ? (
              <div className="space-y-2.5">
                <div className="relative overflow-hidden rounded-xl border border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Selected photo preview"
                    className="max-h-80 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    disabled={submitting}
                    className="absolute top-2.5 right-2.5 size-7 rounded-full bg-background/80 shadow-xs backdrop-blur-md flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-background cursor-pointer transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={`${photoActionClass} h-9 gap-1.5 text-xs`}
                    disabled={submitting}
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="size-3.5 shrink-0" />
                    <span>Retake</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={`${photoActionClass} h-9 gap-1.5 text-xs`}
                    disabled={submitting}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <ImageIcon className="size-3.5 shrink-0" />
                    <span>Choose other</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  className={`${photoActionClass} h-11 gap-2 text-xs sm:text-sm`}
                  disabled={submitting}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="size-4 shrink-0" />
                  <span>Take photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`${photoActionClass} h-11 gap-2 text-xs sm:text-sm`}
                  disabled={submitting}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <ImageIcon className="size-4 shrink-0" />
                  <span>Photo library</span>
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="caption"
              className="text-xs sm:text-sm font-medium text-foreground/85"
            >
              {kind === "text" ? "What happened?" : "Caption (optional)"}
            </Label>
            <div className="flex items-center gap-1.5">
              <EmojiPicker
                onSelectEmoji={handleSelectEmoji}
                disabled={submitting}
              />
              <span className="font-mono text-[0.7rem] sm:text-xs text-muted-foreground/80">
                {caption.length}/{MAX_TEXT_LENGTH}
              </span>
            </div>
          </div>
          <Textarea
            ref={textareaRef}
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
            className="min-h-[140px] resize-none rounded-xl border-border/80 bg-background/50 p-3 font-sans text-base md:text-sm leading-relaxed transition-colors placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.currentTarget.form?.requestSubmit();
              }
            }}
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
