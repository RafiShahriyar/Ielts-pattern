'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Unwraps the {ok,data,error} envelope from main so the UI can just await values.
async function call(channel, ...args) {
  const res = await ipcRenderer.invoke(channel, ...args);
  if (!res || !res.ok) throw new Error((res && res.error) || 'Unknown IPC error');
  return res.data;
}

// Read synchronously at preload time so the page can set its theme during parse,
// before anything is painted.
const initialTheme = ipcRenderer.sendSync('settings:initialTheme');

contextBridge.exposeInMainWorld('api', {
  initialTheme,
  platform: process.platform,
  list: (opts) => call('patterns:list', opts),
  create: (input) => call('patterns:create', input),
  update: (id, input) => call('patterns:update', id, input),
  remove: (id) => call('patterns:delete', id),
  categories: () => call('patterns:categories'),
  getTheme: () => call('settings:getTheme'),
  setTheme: (theme) => call('settings:setTheme', theme),
  dbPath: () => call('app:dbPath'),
  revealDb: () => call('app:revealDb'),

  // The OS title bar is hidden, so the app draws its own window buttons.
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    toggleMaximize: () => ipcRenderer.send('window:toggleMaximize'),
    close: () => ipcRenderer.send('window:close'),
    /** Returns an unsubscribe function. */
    onMaximized: (cb) => {
      const listener = (_event, isMaximized) => cb(Boolean(isMaximized));
      ipcRenderer.on('window:maximized', listener);
      return () => ipcRenderer.removeListener('window:maximized', listener);
    },
  },
});
