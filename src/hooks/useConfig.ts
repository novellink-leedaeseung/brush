// src/hooks/useConfig.ts
import { useEffect, useState, useCallback } from "react";

// electron 환경일 때만 ipcRenderer를 가져옴
let ipcRenderer: any = null;
if (window.require) {
  try {
    ipcRenderer = window.require('electron').ipcRenderer;
  } catch (e) {
    console.warn("ipcRenderer is not available", e);
  }
}

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

let _cachedConfig: AppConfig | null = null;
let _pending: Promise<AppConfig> | null = null;

/** 웹(dev)에서 /config.json 읽기 */
async function fetchDevConfig(): Promise<AppConfig> {
  const url = `/config.json?ts=${Date.now()}`; // 캐시 무시
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  const json = (await res.json()) as Partial<AppConfig>;
  return { ...DEFAULT_CONFIG_FALLBACK, ...json };
}

async function _fetchConfig(): Promise<AppConfig> {
  // 1) Electron 런타임이면 IPC 우선
  if (ipcRenderer) {
    return ipcRenderer.invoke('config:get');
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
  // 3) 그 외: 안전하게 기본값
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
  let cfg: AppConfig;
  if (ipcRenderer) {
    cfg = await ipcRenderer.invoke('config:reload');
  } else if (import.meta.env?.DEV) {
    cfg = await fetchDevConfig();
  } else {
    cfg = DEFAULT_CONFIG_FALLBACK;
  }
  _cachedConfig = cfg;
  _pending = null;
  // 다른 훅 인스턴스에게 리로드되었음을 알림
  window.dispatchEvent(new CustomEvent('config-reloaded', { detail: cfg }));
  return cfg;
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

    // 실시간 업데이트 리스너
    const handleConfigUpdate = (event: any, newConfig: AppConfig) => {
      console.log('[useConfig] Received config:updated event', newConfig);
      _cachedConfig = newConfig;
      if (alive) {
        setConfig(newConfig);
      }
    };

    if (ipcRenderer) {
      ipcRenderer.on('config:updated', handleConfigUpdate);
    }

    // 수동 리로드 리스너
    const handleReloadEvent = (event: Event) => {
        const customEvent = event as CustomEvent<AppConfig>;
        if (alive) {
            setConfig(customEvent.detail);
        }
    }
    window.addEventListener('config-reloaded', handleReloadEvent);

    return () => {
      alive = false;
      if (ipcRenderer) {
        ipcRenderer.removeListener('config:updated', handleConfigUpdate);
      }
      window.removeEventListener('config-reloaded', handleReloadEvent);
    };
  }, [config]);

  const doReload = useCallback(async () => {
    return await reloadConfig();
  }, []);

  return { config, reload: doReload };
}

export async function getApiBase(): Promise<string> {
  const cfg = await getConfig();
  return cfg.apiBaseUrl.replace(/\/+$/, "");
}