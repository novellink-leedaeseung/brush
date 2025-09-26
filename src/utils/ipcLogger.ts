// src/utils/ipcLogger.ts

type IpcRendererLike = {
  send: (channel: string, ...args: any[]) => void;
};

let ipcRenderer: IpcRendererLike | null = null;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function pad(value: number, length = 2) {
  return String(value).padStart(length, '0');
}

function formatKstTimestamp(date = new Date()) {
  const kstDate = new Date(date.getTime() + KST_OFFSET_MS);
  return `${kstDate.getUTCFullYear()}-${pad(kstDate.getUTCMonth() + 1)}-${pad(kstDate.getUTCDate())}`
    + ` ${pad(kstDate.getUTCHours())}:${pad(kstDate.getUTCMinutes())}:${pad(kstDate.getUTCSeconds())}.${pad(kstDate.getUTCMilliseconds(), 3)} KST`;
}

function resolveIpcRenderer(): IpcRendererLike | null {
  if (ipcRenderer) return ipcRenderer;

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const anyWindow = window as any;
    if (anyWindow.require) {
      ipcRenderer = anyWindow.require('electron').ipcRenderer;
    } else if (anyWindow.electronAPI?.send) {
      ipcRenderer = {
        send: (channel: string, ...args: any[]) => anyWindow.electronAPI.send(channel, ...args),
      };
    } else if (anyWindow.electron?.ipcRenderer) {
      ipcRenderer = anyWindow.electron.ipcRenderer;
    }
  } catch (err) {
    console.warn('[ipcLogger] ipcRenderer not available', err);
  }

  return ipcRenderer;
}

function sendLogEvent(channel: string, entry: Record<string, unknown>, devLabel: string) {
  const ipc = resolveIpcRenderer();
  const payload = {
    ...entry,
    loggedAt: formatKstTimestamp(),
  };

  if (ipc) {
    try {
      ipc.send(channel, payload);
    } catch (err) {
      console.error(`[ipcLogger] Failed to send ${devLabel} entry`, err);
    }
  } else if (import.meta.env?.DEV) {
    console.debug(`[ipcLogger:${devLabel}]`, payload);
  }
}

export type ButtonClickLogPayload = {
  buttonId?: string | null;
  text?: string | null;
  path?: string | null;
  dataAttributes?: Record<string, string> | null;
  extra?: Record<string, unknown> | null;
};

export function logButtonClick(payload: ButtonClickLogPayload) {
  sendLogEvent('log:button-click', payload, 'button');
}

export type ApiLogPayload = {
  stage: 'request' | 'response' | 'error';
  requestId: string | null;
  label?: string | null;
  method?: string | null;
  url?: string | null;
  status?: number | null;
  durationMs?: number | null;
  success?: boolean;
  message?: string | null;
  code?: string | null;
  extra?: Record<string, unknown> | null;
};

export function logApiEvent(payload: ApiLogPayload) {
  sendLogEvent('log:api-event', payload, 'api');
}

// Warm up once in case the environment is ready immediately.
resolveIpcRenderer();
