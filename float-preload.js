const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('floatAPI', {
  showMain:     ()       => ipcRenderer.invoke('show-from-float'),
  moveBy:       (dx, dy) => ipcRenderer.invoke('float-move-by', dx, dy),
  savePosition: ()       => ipcRenderer.invoke('float-save-position'),
});
