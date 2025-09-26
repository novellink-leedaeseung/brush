// electron.js
const { app, BrowserWindow, protocol, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const isDev = require('electron-is-dev');

/* =========================
   [CONFIG] 런타임 설정
   - 읽기: 포터블/EXE 옆 → userData 순으로 탐색.
   - 쓰기/생성: 항상 userData 폴더에만 저장. (가장 안정적)
========================= */
const DEFAULT_CONFIG = {
  kioskId: "MTA001",
  titleText: "양치!",
  timeout: 60,
  slideTime: 3,
  apiBaseUrl: "http://127.0.0.1:3001",
  toothbrushModalTimeout: 5000,
  lunchStartTime: 12,
  lunchEndTime: 13,
  logo: "novellink.png"
};

// --- 경로 함수들 ---
function getExeDir() {
  return isDev ? process.cwd() : path.dirname(app.getPath('exe'));
}

function getUserDataDir() {
  return app.getPath('userData');
}

// --- 설정 파일 경로 ---
const userDataConfigPath = path.join(getUserDataDir(), 'config.json');

// --- 로그 경로 및 유틸 ---
const LOG_DIR_NAME = 'logs';
const BUTTON_LOG_FILE = 'button-clicks.log';

function getLogDir() {
  return path.join(getUserDataDir(), LOG_DIR_NAME);
}

function getButtonLogPath() {
  return path.join(getLogDir(), BUTTON_LOG_FILE);
}

function ensureLogDirExists() {
  try {
    fs.mkdirSync(getLogDir(), { recursive: true });
  } catch (err) {
    console.error('[log] Failed to ensure log directory', err);
  }
}

function serializeForLog(payload) {
  if (payload === undefined || payload === null) return '';
  try {
    if (typeof payload === 'string') {
      return payload;
    }
    return JSON.stringify(payload);
  } catch (err) {
    console.error('[log] Failed to serialize payload', err);
    return '"[unserializable]"';
  }
}

function writeLogLine(eventType, payload) {
  try {
    ensureLogDirExists();
    const line = `[${new Date().toISOString()}] [${eventType}] ${serializeForLog(payload)}\n`;
    fs.appendFileSync(getButtonLogPath(), line, 'utf-8');
  } catch (err) {
    console.error('[log] Failed to write log line', err);
  }
}

function getReadOnlyConfigPaths() {
  const exeDir = getExeDir();
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR;

  const paths = new Set();

  if (portableDir) {
    paths.add(path.join(portableDir, 'config.json'));
  }
  // exe 파일과 같은 위치
  paths.add(path.join(exeDir, 'config.json'));

  return Array.from(paths);
}


// --- 설정 관리 로직 ---
let mainWindow = null;
let currentConfig = { ...DEFAULT_CONFIG };
let currentConfigPath = null;
let configWatcher = null; // 파일 감시자

// 파일을 읽고 파싱하는 헬퍼
function readConfigFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const obj = JSON.parse(raw);
      console.log(`[config] Read success: ${filePath}`);
      return obj && typeof obj === 'object' ? obj : null;
    }
  } catch (e) {
    console.error(`[config] Read/parse fail: ${filePath}`, e);
  }
  return null;
}

// 설정을 userData에 저장하는 함수
function saveConfigToUserData(configObject) {
  try {
    fs.mkdirSync(getUserDataDir(), { recursive: true });
    fs.writeFileSync(userDataConfigPath, JSON.stringify(configObject, null, 2), 'utf-8');
    console.log(`[config] SAVED to: ${userDataConfigPath}`);
    return true;
  } catch (e) {
    console.error(`[config] SAVE FAILED to ${userDataConfigPath}:`, e);
    return false;
  }
}

// 앱 시작 시 설정 로드
function loadRuntimeConfig() {
  // 설정 변경을 감지하고 있을 경우, 잠시 중단
  if (configWatcher) {
    configWatcher.close();
    configWatcher = null;
  }

  const candidatePaths = [...getReadOnlyConfigPaths(), userDataConfigPath];
  console.log('[config] Searching for config in:', candidatePaths);
  let loadedConfig = null;
  let loadedPath = null;

  for (const p of candidatePaths) {
    if (!p) continue;
    const configFromFile = readConfigFile(p);
    if (configFromFile) {
      loadedConfig = configFromFile;
      loadedPath = p;
      console.log(`[config] LOADED from: ${p}`);
      break;
    }
  }

  if (!loadedConfig) {
    console.log('[config] No config file found. Creating default config in userData.');
    saveConfigToUserData(DEFAULT_CONFIG);
    currentConfig = { ...DEFAULT_CONFIG };
    currentConfigPath = userDataConfigPath;
  } else {
    currentConfig = { ...DEFAULT_CONFIG, ...loadedConfig };
    currentConfigPath = loadedPath;
  }

  // 만약 로드된 설정이 userData가 아니고, userData에 파일이 없다면 동기화
  if (currentConfigPath !== userDataConfigPath && !fs.existsSync(userDataConfigPath)) {
     console.log('[config] Loaded from read-only location. Syncing to userData for future writes.');
     saveConfigToUserData(currentConfig);
  }

  return currentConfig;
}

/* =========================
   [ASSETS] file:///assets/* 매핑
========================= */
function getAssetsBase() {
  return isDev
    ? path.join(__dirname, 'public', 'assets')
    : path.join(process.resourcesPath, 'assets');
}

function registerAssetProtocols() {
  protocol.interceptFileProtocol('file', (request, callback) => {
    try {
      const raw = decodeURIComponent(request.url); // e.g. file:///assets/icon/home.svg
      let p = raw.replace(/^file:\/\/\//i, '');
      p = p.replace(/^[A-Za-z]:\//, '');

      if (p.toLowerCase().startsWith('assets/')) {
        const resolved = path.join(getAssetsBase(), p.slice('assets/'.length));
        return callback({ path: resolved });
      }
      return callback({ path: url.fileURLToPath(raw) });
    } catch (e) {
      console.error('[interceptFileProtocol]', e);
      callback(-6); // FILE_NOT_FOUND
    }
  });
}

/* =========================
   [WINDOW]
========================= */
function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      // preload: path.join(__dirname, 'preload.js'),
    },
  });

  const indexHtmlPath = url.format({
    pathname: path.join(__dirname, 'dist', 'index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow.loadURL(indexHtmlPath);

  // 디버깅 편의를 위해 항상 개발자 도구를 연다.
  mainWindow.webContents.openDevTools();
}

/* =========================
   [LIFECYCLE]
========================= */
app.whenReady().then(() => {
  // -- 설정 로드 & 파일 감시 설정 --
  loadRuntimeConfig();

  const applyWindowTitle = () => {
    try { mainWindow?.setTitle(currentConfig.titleText || ''); } catch {}
  };
  const broadcastConfig = () => {
    try { mainWindow?.webContents.send('config:updated', currentConfig); } catch {}
  };

  function setupConfigWatcher() {
    if (configWatcher) {
      configWatcher.close();
      configWatcher = null;
    }
    // 현재 사용중인 설정 파일의 변경을 감시
    if (currentConfigPath && fs.existsSync(currentConfigPath)) {
      console.log(`[config] Watching for changes at: ${currentConfigPath}`);
      configWatcher = fs.watch(currentConfigPath, { persistent: false }, (eventType) => {
        if (eventType === 'change') {
          console.log(`[config] Detected change in ${currentConfigPath}. Reloading...`);
          loadRuntimeConfig();
          applyWindowTitle();
          broadcastConfig();
          // 감시 대상 파일이 변경될 수 있으므로, watcher를 다시 설정
          setupConfigWatcher();
        }
      });
    }
  }

  setupConfigWatcher(); // 앱 시작 시 감시 시작

  // -- 프로토콜, 윈도우 생성 --
  registerAssetProtocols();
  createWindow();
  applyWindowTitle();
  broadcastConfig();

  // -- IPC 핸들러 --
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

  ipcMain.handle('config:get', () => currentConfig);
  ipcMain.handle('config:save', async (event, newConfig) => {
    currentConfig = { ...currentConfig, ...newConfig };
    saveConfigToUserData(currentConfig);
    broadcastConfig();
    setupConfigWatcher(); // 저장 후 감시 경로가 바뀔 수 있으므로 다시 설정
    return currentConfig;
  });
  ipcMain.handle('config:reload', () => {
    loadRuntimeConfig();
    applyWindowTitle();
    broadcastConfig();
    setupConfigWatcher(); // 리로드 후 감시 경로가 바뀔 수 있으므로 다시 설정
    return currentConfig;
  });

  // 디버그용: 실제 참조 경로/값 확인
  ipcMain.handle('config:debugPaths', () => ({
    appRoot: getExeDir(), // Simplified for windows
    userDataConfigPath,
    readOnlyCandidatePaths: getReadOnlyConfigPaths(),
    currentConfigPath,
    currentConfig
  }));

  ipcMain.on('log:button-click', (event, rawPayload) => {
    const payload = (rawPayload && typeof rawPayload === 'object') ? rawPayload : { value: rawPayload };
    const logEntry = {
      kioskId: currentConfig?.kioskId ?? null,
      senderURL: event?.senderFrame?.url ?? null,
      ...payload,
    };
    writeLogLine('BUTTON_CLICK', logEntry);
  });

});

app.on('will-quit', () => {
  try {
    globalShortcut.unregisterAll();
  } catch (err) {
    console.warn('[devtools] Failed to unregister shortcuts on quit', err);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
