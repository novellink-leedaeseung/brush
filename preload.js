// preload.js
const { ipcRenderer } = require('electron');

const api = {
  appQuit: () => ipcRenderer.invoke('app:quit'),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  on: (channel, listener) => {
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
};

try {
  if (typeof window !== 'undefined') {
    window.electronAPI = api;
  }
  if (typeof global !== 'undefined') {
    global.electronAPI = api;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.electronAPI = api;
  }
  console.log('[preload] electronAPI injected without contextBridge');
} catch (err) {
  console.error('[preload] Failed to expose electronAPI', err);
}
