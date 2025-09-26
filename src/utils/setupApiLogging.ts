import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { logApiEvent } from '@/utils/ipcLogger';
import { api } from '@/api/ApiAxios';

const REQUEST_META_KEY = Symbol('apiLogMeta');

type RequestMeta = {
  requestId: string;
  startedAt: number;
  label: string;
};

type AxiosWithMeta = AxiosInstance & {
  [REQUEST_META_KEY]?: boolean;
};

function buildRequestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function summarize(value: unknown) {
  if (value === undefined || value === null) return null;
  try {
    const asString = typeof value === 'string' ? value : JSON.stringify(value);
    if (asString.length > 500) {
      return `${asString.slice(0, 500)}…`;
    }
    return asString;
  } catch (err) {
    return '[unserializable]';
  }
}

function resolveUrl(config: AxiosRequestConfig) {
  const base = config.baseURL ?? '';
  const url = config.url ?? '';
  try {
    if (/^https?:/i.test(url)) {
      return url;
    }
    if (base) {
      return new URL(url, base).toString();
    }
  } catch (err) {
    console.warn('[api-logger] Failed to resolve URL', err);
  }
  return base ? `${base.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}` : url;
}

function attachLogging(instance: AxiosInstance, label: string) {
  const anyInstance = instance as AxiosWithMeta;
  if (anyInstance[REQUEST_META_KEY]) {
    return;
  }
  anyInstance[REQUEST_META_KEY] = true;

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const meta: RequestMeta = {
      requestId: buildRequestId(),
      startedAt: Date.now(),
      label,
    };
    (config as any)[REQUEST_META_KEY] = meta;

    const extra: Record<string, unknown> = {};
    const paramsSummary = summarize(config.params);
    if (paramsSummary) extra.params = paramsSummary;
    const dataSummary = summarize((config as any).data);
    if (dataSummary) extra.data = dataSummary;

    logApiEvent({
      stage: 'request',
      requestId: meta.requestId,
      label,
      method: config.method ? config.method.toUpperCase() : null,
      url: resolveUrl(config),
      success: true,
      extra: Object.keys(extra).length ? extra : null,
    });

    return config;
  }, (error) => {
    logApiEvent({
      stage: 'error',
      requestId: null,
      label,
      method: error?.config?.method ? error.config.method.toUpperCase() : null,
      url: error?.config ? resolveUrl(error.config) : null,
      success: false,
      message: error?.message ?? null,
      code: error?.code ?? null,
    });
    return Promise.reject(error);
  });

  instance.interceptors.response.use((response: AxiosResponse) => {
    const meta: RequestMeta | undefined = (response.config as any)[REQUEST_META_KEY];
    const duration = meta ? Date.now() - meta.startedAt : null;

    logApiEvent({
      stage: 'response',
      requestId: meta?.requestId ?? null,
      label,
      method: response.config?.method ? response.config.method.toUpperCase() : null,
      url: resolveUrl(response.config),
      status: response.status,
      durationMs: duration,
      success: true,
      extra: response.statusText ? { statusText: response.statusText } : null,
    });

    return response;
  }, (error) => {
    const config = error?.config as AxiosRequestConfig | undefined;
    const meta: RequestMeta | undefined = config ? (config as any)[REQUEST_META_KEY] : undefined;
    const duration = meta ? Date.now() - meta.startedAt : null;

    const extra: Record<string, unknown> = {};
    const dataSummary = summarize(error?.response?.data);
    if (dataSummary) extra.responseData = dataSummary;
    const headersSummary = summarize(error?.response?.headers);
    if (headersSummary) extra.responseHeaders = headersSummary;

    logApiEvent({
      stage: 'error',
      requestId: meta?.requestId ?? null,
      label,
      method: config?.method ? config.method.toUpperCase() : null,
      url: config ? resolveUrl(config) : null,
      status: error?.response?.status ?? null,
      durationMs: duration,
      success: false,
      message: error?.message ?? null,
      code: error?.code ?? null,
      extra: Object.keys(extra).length ? extra : null,
    });

    return Promise.reject(error);
  });
}

export function setupApiLogging() {
  attachLogging(axios, 'axios');
  attachLogging(api, 'api');
}
