'use strict';

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const {
  app, BrowserWindow, Menu, ipcMain, dialog, shell, protocol, net, nativeTheme,
} = require('electron');

const db = require('./db');

// Without this, unpackaged runs store data in the shared Roaming/Electron
// folder, mixing this app's database in with every other dev Electron app.
app.setName('IELTS Pattern Bank');

const isDev = process.env.NODE_ENV === 'development';
const DEV_URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '..', 'out');

const THEMES = new Set(['system', 'light', 'dark', 'crimson']);

// Kept in step with the --bg token of each theme in globals.css so the native
// window frame paints the right colour before the renderer draws anything.
const THEME_BG = { light: '#f6f7f9', dark: '#16181c', crimson: '#0a0a0c' };


let dbPath;
let currentTheme = 'system';

function themeBackground(theme) {
  if (theme === 'system') {
    return nativeTheme.shouldUseDarkColors ? THEME_BG.dark : THEME_BG.light;
  }
  return THEME_BG[theme] || THEME_BG.light;
}

// The static Next.js export references assets with absolute paths (/_next/...),
// which file:// cannot resolve. A custom scheme keeps those paths working.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function registerAppProtocol() {
  protocol.handle('app', async (request) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url).pathname);
    } catch {
      return new Response('Bad request', { status: 400 });
    }

    let filePath = path.join(OUT_DIR, pathname);

    // Never serve anything outside the export directory.
    if (path.relative(OUT_DIR, filePath).startsWith('..')) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const candidate = path.join(filePath, 'index.html');
      filePath = fs.existsSync(candidate) ? candidate : path.join(OUT_DIR, 'index.html');
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

// The app navigates through its own top bar, so the stock File/Edit/View menu
// is dead weight. macOS still needs one for the standard app and edit keys.
function setupMenu() {
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null);
    return;
  }
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }])
  );
}

function createWindow() {
  const win = new BrowserWindow({
    // Wide enough that the centred tabs and the filters either side of them in
    // the top bar all get comfortable room without maximising.
    width: 1280,
    height: 820,
    minWidth: 760,
    minHeight: 540,
    title: 'IELTS Pattern Bank',
    backgroundColor: themeBackground(currentTheme),
    autoHideMenuBar: true,
    // Drops the OS title bar so the app's nav runs to the top edge of the
    // window. Windows and Linux get the app's own control buttons drawn in the
    // nav; macOS keeps its native traffic lights, nudged to line up with it.
    titleBarStyle: 'hidden',
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 16, y: 18 } }
      : {}),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once('ready-to-show', () => win.show());

  const sendMaximized = () => {
    if (!win.isDestroyed()) win.webContents.send('window:maximized', win.isMaximized());
  };
  win.on('maximize', sendMaximized);
  win.on('unmaximize', sendMaximized);
  win.webContents.on('did-finish-load', sendMaximized);

  // External links open in the real browser, never inside the app shell.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Removing the menu also removes its accelerators; keep reload and devtools
  // reachable while developing.
  if (isDev) {
    win.webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown') return;
      const key = (input.key || '').toLowerCase();
      if (key === 'f12' || (input.control && input.shift && key === 'i')) {
        win.webContents.toggleDevTools();
        event.preventDefault();
      }
      if (input.control && key === 'r') {
        win.webContents.reload();
        event.preventDefault();
      }
    });
  }

  if (isDev) win.loadURL(DEV_URL);
  else win.loadURL('app://bundle/index.html');

  return win;
}

/** Wraps a handler so renderer-side callers get {ok,data} | {ok,error} instead of raw throws. */
function handle(channel, fn) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return { ok: true, data: await fn(...args) };
    } catch (err) {
      return { ok: false, error: err && err.message ? err.message : String(err) };
    }
  });
}

function registerIpc() {
  handle('patterns:list', (opts) => db.list(opts || {}));
  handle('patterns:create', (input) => db.create(input));
  handle('patterns:update', (id, input) => db.update(id, input));
  handle('patterns:delete', (id) => db.remove(id));
  handle('patterns:categories', () => db.categories());

  handle('settings:getTheme', () => currentTheme);
  handle('settings:setTheme', (theme) => {
    if (!THEMES.has(theme)) throw new Error(`Unknown theme: ${theme}`);
    currentTheme = theme;
    db.setSetting('theme', theme);
    const bg = themeBackground(theme);
    for (const win of BrowserWindow.getAllWindows()) win.setBackgroundColor(bg);
    return currentTheme;
  });

  handle('app:dbPath', () => dbPath);
  handle('app:revealDb', () => {
    shell.showItemInFolder(dbPath);
    return true;
  });

  const senderWindow = (event) => BrowserWindow.fromWebContents(event.sender);

  ipcMain.on('window:minimize', (event) => senderWindow(event)?.minimize());
  ipcMain.on('window:close', (event) => senderWindow(event)?.close());
  ipcMain.on('window:toggleMaximize', (event) => {
    const win = senderWindow(event);
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });

  // Synchronous so preload can hand the renderer a theme before first paint.
  ipcMain.on('settings:initialTheme', (event) => {
    event.returnValue = currentTheme;
  });
}

app.whenReady().then(() => {
  dbPath = path.join(app.getPath('userData'), 'patterns.db');

  try {
    db.init(dbPath);
    const stored = db.getSetting('theme', 'system');
    currentTheme = THEMES.has(stored) ? stored : 'system';
  } catch (err) {
    dialog.showErrorBox(
      'Database error',
      `Could not open the pattern database at:\n${dbPath}\n\n${err.message}`
    );
    app.quit();
    return;
  }

  if (!isDev) registerAppProtocol();
  setupMenu();
  registerIpc();
  createWindow();

  // Following the OS means the window frame has to track it too.
  nativeTheme.on('updated', () => {
    if (currentTheme !== 'system') return;
    const bg = themeBackground('system');
    for (const win of BrowserWindow.getAllWindows()) win.setBackgroundColor(bg);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => db.close());
