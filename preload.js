// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // invoke 패턴으로 사용
  appQuit: () => ipcRenderer.invoke('app:quit'),
  // 필요하면 추가 노출: send/on 등
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  on: (channel, listener) => {
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
});
