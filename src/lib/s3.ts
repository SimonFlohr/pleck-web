import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error("AWS_ACCESS_KEY_ID is not set");
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_SECRET_ACCESS_KEY is not set");
}

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const BUCKET = process.env.AWS_S3_BUCKET_NAME ?? "pleck-media-dev-use2";

export const PRESIGN_GET_TTL_SECONDS = 15 * 60; // 15 minutes

export function presignGet(key: string, expiresIn = PRESIGN_GET_TTL_SECONDS) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn,
  });
}
