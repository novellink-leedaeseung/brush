// src/utils/ipcLogger.ts

type IpcRendererLike = {
  send: (channel: string, ...args: any[]) => void;
};

let ipcRenderer: IpcRendererLike | null = null;

if (typeof window !== 'undefined' && (window as any).require) {
  try {
    ipcRenderer = (window as any).require('electron').ipcRenderer;
  } catch (err) {
    console.warn('[ipcLogger] ipcRenderer not available', err);
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
  const entry = {
    ...payload,
    clickedAt: new Date().toISOString(),
  };

  if (ipcRenderer) {
    ipcRenderer.send('log:button-click', entry);
  } else if (import.meta.env?.DEV) {
    console.debug('[button-log]', entry);
  }
}
