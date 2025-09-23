// electron.js
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

function getAssetsBase() {
  // dev: 프로젝트/assets, prod: resources/assets
  return isDev
    ? path.join(__dirname, 'assets')
    : path.join(process.resourcesPath, 'assets');
}

function registerAssetProtocols() {
  const assetsBase = getAssetsBase();

  // 1) file:///assets/... → resources/assets/... 로 매핑
  protocol.interceptFileProtocol('file', (request, callback) => {
    try {
      const raw = decodeURIComponent(request.url); // e.g. file:///assets/logo/a.png
      const m = raw.match(/^file:\/\/\/assets\/(.+)$/i);
      if (m) {
        const resolved = path.join(assetsBase, m[1]);
        return callback({ path: resolved });
      }
      // 기본 file:// 처리
      return callback({ path: url.fileURLToPath(raw) });
    } catch (e) {
      console.error('[file intercept error]', e);
      callback(-6); // FILE_NOT_FOUND
    }
  });

  // 2) appres://assets/... → resources/assets/... 매핑(선택)
  protocol.registerFileProtocol('appres', (request, callback) => {
    try {
      // appres://assets/logo/a.png  →  assets/logo/a.png
      const pathname = decodeURIComponent(request.url.replace(/^appres:\/\//i, ''));
      const resolved = path.join(assetsBase, pathname.replace(/^assets\//i, ''));
      callback({ path: resolved });
    } catch (e) {
      console.error('[appres protocol error]', e);
      callback(-6);
    }
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 1920,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // file:// + 로컬 리소스 허용
    },
  });

  // dist/index.html을 file://로 로드
  const indexHtmlPath = url.format({
    pathname: path.join(__dirname, 'dist', 'index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow.loadURL(indexHtmlPath);

  if (isDev) mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  registerAssetProtocols(); // ★ 반드시 윈도우 생성 전 등록
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
