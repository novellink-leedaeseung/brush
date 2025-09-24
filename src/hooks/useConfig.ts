// src/hooks/useConfig.ts
import { useEffect, useState, useCallback } from "react";

export interface AppConfig {
  kioskId: string;
  titleText: string;
  timeout: number;
  slideTime: number;
  apiBaseUrl: string;
  toothbrushModalTimeout: number;
  lunchStartTime: number;
  lunchEndTime: number;
  logo: string;
}

const DEFAULT_CONFIG_FALLBACK: AppConfig = {
  kioskId: "MTA001",
  titleText: "양치!",
  timeout: 60,
  slideTime: 3,
  apiBaseUrl: "http://127.0.0.1:3001",
  toothbrushModalTimeout: 5000,
  lunchStartTime: 12,
  lunchEndTime: 13,
  logo: "novellink.png",
};

declare global {
  interface Window {
    appConfig?: {
      get: () => Promise<AppConfig>;
      reload: () => Promise<AppConfig>;
      // onUpdated?: (cb: (cfg: AppConfig) => void) => void;
    };
  }
}

let _cachedConfig: AppConfig | null = null;
let _pending: Promise<AppConfig> | null = null;

/** 웹(dev)에서 /config.json 읽기 */
async function fetchDevConfig(): Promise<AppConfig> {
  const url = `/config.json?ts=${Date.now()}`; // 캐시 무시
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  const json = (await res.json()) as Partial<AppConfig>;
  // 기본값과 머지해서 타입 보장
  return { ...DEFAULT_CONFIG_FALLBACK, ...json };
}

async function _fetchConfig(): Promise<AppConfig> {
  // 1) Electron 런타임이면 IPC 우선
  if (window.appConfig?.get) {
    return await window.appConfig.get();
  }
  // 2) Vite dev 서버(웹)면 /public/config.json을 fetch
  if (import.meta.env?.DEV) {
    try {
      return await fetchDevConfig();
    } catch (e) {
      console.warn("[useConfig] dev fetch fallback:", e);
      return DEFAULT_CONFIG_FALLBACK;
    }
  }
  // 3) 그 외(테스트/SSR/프로덕션 웹 빌드 등): 안전하게 기본값
  return DEFAULT_CONFIG_FALLBACK;
}

export async function getConfig(): Promise<AppConfig> {
  if (_cachedConfig) return _cachedConfig;
  if (_pending) return _pending;
  _pending = _fetchConfig().then((c) => {
    _cachedConfig = c;
    _pending = null;
    return c;
  });
  return _pending;
}

export async function reloadConfig(): Promise<AppConfig> {
  if (window.appConfig?.reload) {
    const cfg = await window.appConfig.reload();
    _cachedConfig = cfg;
    _pending = null;
    return cfg;
  }
  // 웹(dev)일 때 수동 리로드
  if (import.meta.env?.DEV) {
    const cfg = await fetchDevConfig();
    _cachedConfig = cfg;
    _pending = null;
    return cfg;
  }
  _cachedConfig = DEFAULT_CONFIG_FALLBACK;
  _pending = null;
  return _cachedConfig;
}

export function setConfigCache(cfg: AppConfig) {
  _cachedConfig = cfg;
  _pending = null;
}

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(_cachedConfig);
  useEffect(() => {
    let alive = true;
    if (!config) {
      getConfig().then((c) => {
        if (alive) setConfig(c);
      });
    }
    return () => {
      alive = false;
    };
  }, [config]);

  const doReload = useCallback(async () => {
    const c = await reloadConfig();
    setConfig(c);
    return c;
  }, []);

  return { config, reload: doReload };
}

export async function getApiBase(): Promise<string> {
  const cfg = await getConfig();
  return cfg.apiBaseUrl.replace(/\/+$/, "");
}
