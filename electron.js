// electron.js
const {app, BrowserWindow, protocol, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const isDev = require('electron-is-dev');

/* =========================
   [CONFIG] 최소 구현부
   - exe 옆(config.json) 생성/로드
   - IPC: config:get, config:reload
========================= */
// electron.js 안에 있던 DEFAULT_CONFIG 교체
// electron.js 안 DEFAULT_CONFIG
const DEFAULT_CONFIG = {
    // ✅ 키오스크 장비 식별자 (연동 장비 ID)
    kioskId: "MTA001",

    // ✅ 화면 상단에 표시할 제목 텍스트
    titleText: "양치!",

    // ✅ 사용자가 일정 시간(초) 동안 터치하지 않으면 메인 홈으로 돌아가는 시간
    timeout: 60,

    // ✅ 홈 화면 공지/슬라이드가 바뀌는 주기 (초 단위)
    slideTime: 3,

    // ✅ API 서버 주소
    apiBaseUrl: "http://127.0.0.1:3001",

    // ✅ 양치 인증 완료 화면이 표시되는 시간 (밀리초 단위)
    toothbrushModalTimeout: 5000,

    // ✅ 점심시간 시작 시각 (24시간제, 시 단위)
    lunchStartTime: 12,

    // ✅ 점심시간 종료 시각 (24시간제, 시 단위)
    lunchEndTime: 13,

    // ✅ 로고 파일명 (public/assets 등 정적 경로에 위치해야 함)
    //    화면 좌측 상단이나 타이틀 영역에 표시할 이미지
    logo: "novellink.png"
};


function getBaseDir() {
    // 포터블(EXE) 실행 시 PORTABLE_EXECUTABLE_DIR 우선
    return process.env.PORTABLE_EXECUTABLE_DIR || process.cwd();
}

function getConfigPath() {
    return path.join(getBaseDir(), 'config.json');
}

function ensureConfig() {
    const p = getConfigPath();
    if (!fs.existsSync(p)) {
        fs.writeFileSync(p, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
        return DEFAULT_CONFIG;
    }
    try {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        // 기본값과 merge (누락 키 보완)
        return {...DEFAULT_CONFIG, ...parsed};
    } catch (e) {
        console.error('⚠️ config.json 파싱 실패. 기본값 사용:', e);
        return DEFAULT_CONFIG;
    }
}

let currentConfig = ensureConfig();

/* =========================
   [ASSETS] file:///assets/* 매핑
========================= */
function getAssetsBase() {
    // dev: 프로젝트/public/assets , prod: resources/assets
    return isDev
        ? path.join(__dirname, 'public', 'assets')
        : path.join(process.resourcesPath, 'assets');
}

function registerAssetProtocols() {
    protocol.interceptFileProtocol('file', (request, callback) => {
        try {
            const raw = decodeURIComponent(request.url); // e.g. file:///assets/icon/home.svg
            let p = raw.replace(/^file:\/\/\//i, '');    // -> 'assets/... or C:/assets/...'
            p = p.replace(/^[A-Za-z]:\//, '');           // -> 'assets/...'

            if (p.toLowerCase().startsWith('assets/')) {
                const resolved = path.join(getAssetsBase(), p.slice('assets/'.length));
                return callback({path: resolved});
            }
            return callback({path: url.fileURLToPath(raw)});
        } catch (e) {
            console.error('[interceptFileProtocol]', e);
            callback(-6); // FILE_NOT_FOUND
        }
    });
}

/* =========================
   [WINDOW] 생성
========================= */
let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 1920,
        webPreferences: {
            // 현재 프로젝트가 renderer에서 require/ipcRenderer를 직접 쓰는 구조면 아래 설정 유지
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            // 만약 preload 브릿지로 보안 강화하고 싶으면 위 두 옵션을 바꾸고 preload 추가
            // preload: path.join(__dirname, 'preload.js'),
        },
    });

    const indexHtmlPath = url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true,
    });
    mainWindow.loadURL(indexHtmlPath);

    if (isDev) mainWindow.webContents.openDevTools();
}

/* =========================
   [LIFECYCLE] whenReady 단일화
========================= */
app.whenReady().then(() => {
    registerAssetProtocols();
    createWindow();

    // ✅ 앱 종료 IPC
    ipcMain.handle('app:quit', async () => {
        try {
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
            app.quit();
        }
    });

    // ✅ 설정 IPC
    ipcMain.handle('config:get', () => currentConfig);
    ipcMain.handle('config:reload', () => {
        currentConfig = ensureConfig();
        return currentConfig;
    });

    // (선택) 파일 변경 자동 감지 원하면 주석 해제
    // fs.watch(getConfigPath(), { persistent: false }, () => {
    //   currentConfig = ensureConfig();
    //   mainWindow?.webContents.send('config:updated', currentConfig);
    // });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
