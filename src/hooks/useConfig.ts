// src/hooks/useConfig.ts
import {useEffect, useState, useCallback} from "react";

/** 앱에서 사용하는 설정 스키마 */
export type AppConfig = {
    apiBaseUrl: string;
    logo: string;
    themeColor: string;
    title: string;
    language: string;
    enableCamera: boolean;
    enableMic: boolean;
    timeoutSeconds: number;
    kioskId: string
    // 필요한 설정 항목을 전부 여기에 추가
};

// (안전장치) 프론트 쪽 기본값 — 혹시 메인에서 못 받아올 때 타입 보장을 위해 사용
const DEFAULT_CONFIG_FALLBACK: AppConfig = {
    apiBaseUrl: "http://127.0.0.1:3001",
    logo: "novellink.png",
    themeColor: "#227EFF",
    title: "노블링크 메디터치",
    language: "ko",
    enableCamera: true,
    enableMic: false,
    timeoutSeconds: 60,
    kioskId: 'MTA001'
};

// preload에서 노출되는 브릿지 타입 선언
declare global {
    interface Window {
        appConfig?: {
            get: () => Promise<AppConfig>;
            reload: () => Promise<AppConfig>;
            // 선택: 메인에서 fs.watch로 config 변경 브로드캐스트할 때 사용
            // onUpdated?: (cb: (cfg: AppConfig) => void) => void;
        };
    }
}

/* -------------------------
   모듈 레벨 캐시 (서비스/유틸에서 재사용)
------------------------- */
let _cachedConfig: AppConfig | null = null;
let _pendingPromise: Promise<AppConfig> | null = null;

/** 내부용: 실제로 브릿지 호출해서 설정 읽기 */
async function _fetchConfig(): Promise<AppConfig> {
    // preload 브릿지가 있으면 그걸 우선 사용
    if (window.appConfig?.get) {
        const cfg = await window.appConfig.get();
        return cfg;
    }
    // 브릿지가 없다면(개발/테스트 등) 안전하게 fallback
    return DEFAULT_CONFIG_FALLBACK;
}

/** 한 번 읽고 캐시: 컴포넌트 밖(서비스/유틸)에서 사용해도 안전 */
export async function getConfig(): Promise<AppConfig> {
    if (_cachedConfig) return _cachedConfig;
    if (_pendingPromise) return _pendingPromise;

    _pendingPromise = _fetchConfig().then((c) => {
        _cachedConfig = c;
        _pendingPromise = null;
        return c;
    });

    return _pendingPromise;
}

/** 강제 리로드 (메인의 ensureConfig 재호출) */
export async function reloadConfig(): Promise<AppConfig> {
    if (window.appConfig?.reload) {
        const cfg = await window.appConfig.reload();
        _cachedConfig = cfg;
        _pendingPromise = null;
        return cfg;
    }
    // 브릿지가 없으면 fallback 유지
    _cachedConfig = DEFAULT_CONFIG_FALLBACK;
    _pendingPromise = null;
    return _cachedConfig;
}

/** 필요 시 외부에서 캐시 값을 주입(메인의 config:updated 이벤트와 연동) */
export function setConfigCache(cfg: AppConfig) {
    _cachedConfig = cfg;
    _pendingPromise = null;
}

/* -------------------------
   React 훅: 컴포넌트에서 바로 사용
------------------------- */
export function useConfig() {
    const [config, setConfig] = useState<AppConfig | null>(_cachedConfig);

    useEffect(() => {
        let alive = true;

        // 캐시가 없으면 로드
        if (!config) {
            getConfig().then((c) => {
                if (alive) setConfig(c);
            });
        }

        // (선택) 실시간 반영: preload에서 onUpdated를 열었을 경우
        // if (window.appConfig?.onUpdated) {
        //   const handler = (c: AppConfig) => {
        //     setConfigCache(c);
        //     if (alive) setConfig(c);
        //   };
        //   window.appConfig.onUpdated(handler);
        //   return () => {
        //     // 필요시 이벤트 해제 로직
        //     alive = false;
        //   };
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
   유틸: API 베이스 URL 조합 (선택)
------------------------- */
export async function getApiBase(): Promise<string> {
    const cfg = await getConfig();
    return cfg.apiBaseUrl.replace(/\/+$/, ""); // 끝 슬래시 제거
}
