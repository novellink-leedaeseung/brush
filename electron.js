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
const LOG_DIR_NAMES = ['log', 'logs'];
const LOG_FILES = {
  button: 'button-clicks.log',
  api: 'api.log',
};
let resolvedLogDir = null;
const failedLogDirs = new Set();
const announcedLogFilePaths = new Map();
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function pad(value, length = 2) {
  return String(value).padStart(length, '0');
}

function formatKstTimestamp(date = new Date()) {
  const kstDate = new Date(date.getTime() + KST_OFFSET_MS);
  return `${kstDate.getUTCFullYear()}-${pad(kstDate.getUTCMonth() + 1)}-${pad(kstDate.getUTCDate())}`
    + ` ${pad(kstDate.getUTCHours())}:${pad(kstDate.getUTCMinutes())}:${pad(kstDate.getUTCSeconds())}.${pad(kstDate.getUTCMilliseconds(), 3)} KST`;
}

function getBaseLogDirCandidates() {
  const bases = new Set();
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR;
  if (portableDir) bases.add(portableDir);
  bases.add(getExeDir());
  bases.add(getUserDataDir());
  return Array.from(bases);
}

function ensureLogDir() {
  if (resolvedLogDir && fs.existsSync(resolvedLogDir)) {
    return resolvedLogDir;
  }

  const bases = getBaseLogDirCandidates();
  for (const base of bases) {
    if (!base) continue;
    for (const dirName of LOG_DIR_NAMES) {
      const candidate = path.join(base, dirName);
      if (failedLogDirs.has(candidate)) {
        continue;
      }
      try {
        fs.mkdirSync(candidate, { recursive: true });
        resolvedLogDir = candidate;
        if (candidate !== path.join(getExeDir(), dirName)) {
          console.warn(`[log] Using fallback log directory: ${candidate}`);
        }
        return resolvedLogDir;
      } catch (err) {
        console.error(`[log] Failed to ensure log directory at ${candidate}`, err);
        failedLogDirs.add(candidate);
      }
    }
  }

  resolvedLogDir = null;
  return null;
}

function getLogPath(logFileName) {
  const dir = ensureLogDir();
  return dir ? path.join(dir, logFileName) : null;
}

function ensureLogFile(logFileName) {
  const logPath = getLogPath(logFileName);
  if (!logPath) return null;

  try {
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, '', 'utf-8');
    }
    return logPath;
  } catch (err) {
    console.error(`[log] Failed to ensure log file ${logFileName}`, err);
    failedLogDirs.add(path.dirname(logPath));
    resolvedLogDir = null;
    return null;
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

function announceLogPath(logFileName, logPath) {
  const prev = announcedLogFilePaths.get(logFileName);
  if (prev !== logPath) {
    console.log(`[log] Writing ${logFileName} logs to: ${logPath}`);
    announcedLogFilePaths.set(logFileName, logPath);
  }
}

function writeLogLine(logFileName, eventType, payload) {
  try {
    let logPath = ensureLogFile(logFileName);
    if (!logPath) {
      console.error('[log] No log directory available. Skipping log write.');
      return;
    }

    announceLogPath(logFileName, logPath);

    const line = `[${formatKstTimestamp()}] [${eventType}] ${serializeForLog(payload)}\n`;
    try {
      fs.appendFileSync(logPath, line, 'utf-8');
      return;
    } catch (err) {
      console.error(`[log] Failed to append log at ${logPath}`, err);
      failedLogDirs.add(path.dirname(logPath));
      resolvedLogDir = null;
      logPath = ensureLogFile(logFileName);
      if (!logPath) {
        console.error('[log] Fallback log directory unavailable after append failure.');
        return;
      }
      console.warn(`[log] Retrying log write for ${logFileName} at fallback path: ${logPath}`);
      announceLogPath(logFileName, logPath);
      fs.appendFileSync(logPath, line, 'utf-8');
    }
  } catch (err) {
    console.error(`[log] Failed to write log line for ${logFileName}`, err);
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
function resolveIndexHtmlPath() {
  const candidates = [];

  const addCandidate = (p) => {
    if (!p) return;
    try {
      candidates.push(path.normalize(p));
    } catch {}
  };

  addCandidate(path.join(__dirname, 'dist', 'index.html'));
  addCandidate(path.join(app.getAppPath(), 'dist', 'index.html'));

  try { addCandidate(path.join(process.resourcesPath, 'app', 'dist', 'index.html')); } catch {}
  try { addCandidate(path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html')); } catch {}
  try { addCandidate(path.join(process.resourcesPath, 'dist', 'index.html')); } catch {}

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {}
  }

  console.error('[main] Failed to resolve index.html. Checked candidates:', candidates);
  return null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  const resolvedIndex = resolveIndexHtmlPath();

  if (resolvedIndex) {
    console.log(`[main] Loading UI from ${resolvedIndex}`);
    mainWindow.loadFile(resolvedIndex);
  } else {
    const fallbackHtml = '<h1 style="font-family: sans-serif; color: #c00; text-align: center; margin-top: 40vh;">index.html not found</h1>';
    mainWindow.loadURL(`data:text/html,${encodeURIComponent(fallbackHtml)}`);
  }

  // 디버깅 편의를 위해 항상 개발자 도구를 연다.
  mainWindow.webContents.openDevTools();
}

/* =========================
   [LIFECYCLE]
========================= */
app.whenReady().then(() => {
  const preparedLogDir = ensureLogDir();
  if (preparedLogDir) {
    console.log(`[log] Log directory ready: ${preparedLogDir}`);
    Object.entries(LOG_FILES).forEach(([key, fileName]) => {
      const logFile = ensureLogFile(fileName);
      if (logFile) {
        console.log(`[log] Log file ready (${key}): ${logFile}`);
      }
    });
  } else {
    console.error('[log] Failed to prepare any log directory.');
  }

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
    console.log('[log] Received button click', logEntry);
    writeLogLine(LOG_FILES.button, 'BUTTON_CLICK', logEntry);
  });

  ipcMain.on('log:api-event', (event, rawPayload) => {
    const payload = (rawPayload && typeof rawPayload === 'object') ? rawPayload : { value: rawPayload };
    const logEntry = {
      kioskId: currentConfig?.kioskId ?? null,
      senderURL: event?.senderFrame?.url ?? null,
      ...payload,
    };
    console.log('[log] Received api event', logEntry);
    writeLogLine(LOG_FILES.api, 'API_EVENT', logEntry);
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
