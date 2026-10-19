import type { CreateSparkInput } from "./schema";

export async function postSpark(payload: CreateSparkInput) {
  const res = await fetch("/api/sparks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Couldn't save spark (${res.status})`);
  }
  return res.json() as Promise<{
    spark: { id: number; authorLocalDate: string };
  }>;
}
