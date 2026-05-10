const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadProfile:       () => ipcRenderer.invoke('load-profile'),
  saveProfile:       (p) => ipcRenderer.invoke('save-profile', p),
  hideWindow:        () => ipcRenderer.invoke('hide-window'),
  quitApp:           () => ipcRenderer.invoke('quit-app'),
  getWindowBounds:   () => ipcRenderer.invoke('get-window-bounds'),
  updateShortcut:    (k) => ipcRenderer.invoke('update-shortcut', k),
  setNativeTheme:    (t) => ipcRenderer.invoke('set-native-theme', t),
  updateDockShortcut:(key, val) => ipcRenderer.invoke('update-dock-shortcut', key, val),
});