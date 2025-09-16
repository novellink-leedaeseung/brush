// 간단한 fetch 래퍼 (Vite)
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export async function uploadImage(blob: Blob, filename = `capture_${Date.now()}.png`) {
  const form = new FormData();
  form.append("file", blob, filename);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  return (await res.json()) as { ok: true; path: string };
}
