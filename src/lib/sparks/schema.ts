import { z } from "zod";
import { MAX_SIZE_BYTES, MAX_TEXT_LENGTH } from "@/lib/media-types";

const mediaSchema = z.object({
  key: z.string().min(1),
  mime: z.string().min(1),
  sizeBytes: z.number().int().positive().max(MAX_SIZE_BYTES),
  sha256: z.string().regex(/^[a-f0-9]{64}$/, "sha256 must be 64 hex chars"),
  originalFilename: z.string().max(255).optional(),
});

export const createSparkSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    textContent: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  }),
  z.object({
    type: z.literal("photo"),
    textContent: z.string().trim().max(MAX_TEXT_LENGTH).optional(),
    media: mediaSchema,
    exifDateTime: z.string().optional(), // raw EXIF "2026:10:04 18:55:00"
  }),
]);

export type CreateSparkInput = z.input<typeof createSparkSchema>;
