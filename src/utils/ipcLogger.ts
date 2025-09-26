// src/utils/ipcLogger.ts

type IpcRendererLike = {
  send: (channel: string, ...args: any[]) => void;
};

let ipcRenderer: IpcRendererLike | null = null;

function resolveIpcRenderer(): IpcRendererLike | null {
  if (ipcRenderer) return ipcRenderer;

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const anyWindow = window as any;
    if (anyWindow.require) {
      ipcRenderer = anyWindow.require('electron').ipcRenderer;
    } else if (anyWindow.electron?.ipcRenderer) {
      ipcRenderer = anyWindow.electron.ipcRenderer;
    }
  } catch (err) {
    console.warn('[ipcLogger] ipcRenderer not available', err);
  }

  return ipcRenderer;
}

export type ButtonClickLogPayload = {
  buttonId?: string | null;
  text?: string | null;
  path?: string | null;
  dataAttributes?: Record<string, string> | null;
  extra?: Record<string, unknown> | null;
};

export function logButtonClick(payload: ButtonClickLogPayload) {
  const entry = {
    ...payload,
    clickedAt: new Date().toISOString(),
  };

  const ipc = resolveIpcRenderer();
  if (ipc) {
    try {
      ipc.send('log:button-click', entry);
    } catch (err) {
      console.error('[ipcLogger] Failed to send log entry', err);
    }
  } else if (import.meta.env?.DEV) {
    console.debug('[button-log]', entry);
  }
}
