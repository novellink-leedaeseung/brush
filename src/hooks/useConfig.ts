import {useEffect, useState, useCallback} from "react";

/** 앱에서 사용하는 설정 스키마 */
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

// (안전장치) 프론트에서만 쓰는 fallback — 메인에서 못 받아올 경우 대비
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

// preload.ts에서 expose된 브릿지 타입 선언
declare global {
    interface Window {
        appConfig?: {
            get: () => Promise<AppConfig>;
            reload: () => Promise<AppConfig>;
            // (선택) config 파일이 바뀌었을 때 push 알림을 쏘도록 구현했다면:
            // onUpdated?: (cb: (cfg: AppConfig) => void) => void;
        };
    }
}

/* -------------------------
   모듈 레벨 캐시 (서비스/유틸에서 재사용)
------------------------- */
let _cachedConfig: AppConfig | null = null;
let _pending: Promise<AppConfig> | null = null;

async function _fetchConfig(): Promise<AppConfig> {
    if (window.appConfig?.get) {
        return await window.appConfig.get();
    }
    return DEFAULT_CONFIG_FALLBACK;
}

/** 최초 1회 로드 + 캐시 */
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

/** 강제 리로드 */
export async function reloadConfig(): Promise<AppConfig> {
    if (window.appConfig?.reload) {
        const cfg = await window.appConfig.reload();
        _cachedConfig = cfg;
        _pending = null;
        return cfg;
    }
    _cachedConfig = DEFAULT_CONFIG_FALLBACK;
    _pending = null;
    return _cachedConfig;
}

/** 외부에서 캐시 주입 (메인에서 push 이벤트 받을 때 사용) */
export function setConfigCache(cfg: AppConfig) {
    _cachedConfig = cfg;
    _pending = null;
}

/* -------------------------
   React 훅
------------------------- */
export function useConfig() {
    const [config, setConfig] = useState<AppConfig | null>(_cachedConfig);

    useEffect(() => {
        let alive = true;
        if (!config) {
            getConfig().then((c) => {
                if (alive) setConfig(c);
            });
        }

        // (선택) config 변경 push 알림 받기
        // if (window.appConfig?.onUpdated) {
        //   const handler = (c: AppConfig) => {
        //     setConfigCache(c);
        //     if (alive) setConfig(c);
        //   };
        //   window.appConfig.onUpdated(handler);
        //   return () => { alive = false; };
        // }

        return () => {
            alive = false;
        };
    }, [config]);

    const doReload = useCallback(async () => {
        const c = await reloadConfig();
        setConfig(c);
        return c;
    }, []);

    return {config, reload: doReload};
}

/* -------------------------
   유틸: API 주소만 필요할 때
------------------------- */
export async function getApiBase(): Promise<string> {
    const cfg = await getConfig();
    return cfg.apiBaseUrl.replace(/\/+$/, ""); // 끝 슬래시 제거
}
