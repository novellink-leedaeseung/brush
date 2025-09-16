// 간단한 fetch 래퍼 (Vite)
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  const body = init.body;

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text}`.trim());
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

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

export interface MemberDto {
  id: number;
  name: string;
  phone: string;
  grade: string;
  classroom: string;
  createdAt: string;
  updatedAt: string;
}

export type MemberPayload = {
  name: string;
  phone: string;
  grade?: string;
  classroom?: string;
};

export async function fetchMembers(): Promise<MemberDto[]> {
  const { data } = await request<{ success: boolean; data: MemberDto[] }>("/api/members");
  return data;
}

export async function fetchMember(id: number | string): Promise<MemberDto> {
  const { data } = await request<{ success: boolean; data: MemberDto }>(`/api/members/${id}`);
  return data;
}

export async function createMember(payload: MemberPayload): Promise<MemberDto> {
  const { data } = await request<{ success: boolean; data: MemberDto }>("/api/members", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateMember(id: number | string, payload: Partial<MemberPayload>): Promise<MemberDto> {
  const { data } = await request<{ success: boolean; data: MemberDto }>(`/api/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function removeMember(id: number | string): Promise<void> {
  await request<undefined>(`/api/members/${id}`, { method: "DELETE" });
}
