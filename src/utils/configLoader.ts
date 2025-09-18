// src/utils/configLoader.ts
export interface AppConfig {
  kioskId?: string;
  titleText?: string;
  logoSrc?: string;
  backgroundColor?: string;
}

let cached: AppConfig | null = null;
let pending: Promise<AppConfig> | null = null;

export async function getConfig(): Promise<AppConfig> {
  if (cached) return cached;
  if (pending) return pending;

  pending = fetch("/config.json")
    .then(async (res) => {
      if (!res.ok) throw new Error(`config.json load failed: ${res.status}`);
      const data = (await res.json()) as AppConfig;
      cached = data;
      return data;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}
