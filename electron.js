// electron.js
const {app, BrowserWindow, protocol, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

app.whenReady().then(() => {
    registerAssetProtocols(); // ★ 윈도우 생성 전 등록
    createWindow();

    // ✅ 렌더러에서 "app:quit" 신호 오면 앱 종료
    ipcMain.handle('app:quit', async () => {
        try {
            // 모든 창 강제 파괴 (beforeunload / close 리스너 무시)
            BrowserWindow.getAllWindows().forEach((w) => {
                try {
                    w.removeAllListeners('close');
                    w.destroy();
                } catch (e) {
                    console.error('window destroy error', e);
                }
            });
        } catch (e) {
            console.error('error destroying windows before quit', e);
        } finally {
            // 최종적으로 앱 종료
            app.quit();
        }
    });
});


function getAssetsBase() {
    // dev: 프로젝트/public/assets , prod: resources/assets
    return isDev
        ? path.join(__dirname, 'public', 'assets')
        : path.join(process.resourcesPath, 'assets');
}

function registerAssetProtocols() {
    const assetsBase = getAssetsBase();

    // file:///assets/... → public/assets (dev) 또는 resources/assets (prod) 매핑
    protocol.interceptFileProtocol('file', (request, callback) => {
        try {
            const raw = decodeURIComponent(request.url); // e.g.
            // file:///assets/icon/home.svg
            // file:///C:/assets/icon/home.svg  ← 이 케이스도 잡아야 함

            // 1) 앞의 'file:///' 제거
            let p = raw.replace(/^file:\/\/\//i, ''); // 'assets/...' 또는 'C:/assets/...'

            // 2) 드라이브 프리픽스 제거 (C:/ → '')
            p = p.replace(/^[A-Za-z]:\//, ''); // 'assets/...'

            // 3) assets로 시작하는지만 체크
            if (p.toLowerCase().startsWith('assets/')) {
                const assetsBase = getAssetsBase(); // dev: __dirname/public/assets, prod: process.resourcesPath/assets
                const resolved = path.join(assetsBase, p.slice('assets/'.length));
                return callback({path: resolved});
            }

            // 그 외 파일은 원래대로 처리
            return callback({path: url.fileURLToPath(raw)});
        } catch (e) {
            console.error('[interceptFileProtocol]', e);
            callback(-6); // FILE_NOT_FOUND
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
            webSecurity: false
        }
    });

    const indexHtmlPath = url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(indexHtmlPath);

    if (isDev) mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    registerAssetProtocols(); // ★ 윈도우 생성 전 등록
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
