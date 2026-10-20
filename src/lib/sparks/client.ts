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

export async function deleteSpark(id: number) {
  const res = await fetch(`/api/sparks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Couldn't delete spark (${res.status})`);
  }
  return res.json() as Promise<{ success: boolean; id: number }>;
}
