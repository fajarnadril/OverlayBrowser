// Electron main process - PoC Overlay Browser
const {
  app,
  BrowserWindow,
  globalShortcut,
  screen,
  ipcMain,
  nativeTheme,
} = require("electron");
const path = require("path");
const fs = require("fs");

const PROFILE_FILE = "profiles.json";

function getProfilePath() {
  return path.join(app.getPath("userData"), PROFILE_FILE);
}

let mainWindow = null;
let floatWindow = null;
let profile = {
  url: "https://chat.deepseek.com/a/chat",
  dockRight: true,
  windowWidth: 420,
  windowHeight: 800,
  windowX: null,
  windowY: null,
  uiColor:   "#141416",
  uiOpacity: 72,
  uiBlur:    18,
  uiAccent:  "#63b3ed",
  shortcut:  "Ctrl+H",
  urlProfiles: [{ name: "DeepSeek", url: "https://chat.deepseek.com/a/chat" }],
};

function loadProfileSync() {
  try {
    const p = getProfilePath();
    if (fs.existsSync(p)) {
      const txt = fs.readFileSync(p, "utf8");
      const data = JSON.parse(txt);
      profile = Object.assign(profile, data);
    }
  } catch (err) {
    console.error("loadProfile error", err);
  }
}

function saveProfileSync() {
  try {
    const p = getProfilePath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(profile, null, 2), "utf8");
  } catch (err) {
    console.error("saveProfile error", err);
  }
}

function positionWindow(win) {
  const disp = screen.getPrimaryDisplay();
  const wa = disp.workArea;
  const width  = Math.max(200, profile.windowWidth  || 420);
  const height = Math.max(100, profile.windowHeight || 800);
  const x = profile.windowX != null ? profile.windowX : (profile.dockRight ? wa.x + wa.width - width : wa.x);
  const y = profile.windowY != null ? profile.windowY : wa.y;
  win.setBounds({ x, y, width, height });
}

function createFloatWindow() {
  const disp = screen.getPrimaryDisplay();
  const wa = disp.workArea;
  const fw = 64, fh = 64;
  const x = profile.floatX != null ? profile.floatX : wa.x + wa.width - fw - 20;
  const y = profile.floatY != null ? profile.floatY : wa.y + wa.height - fh - 20;

  floatWindow = new BrowserWindow({
    width: fw, height: fh, x, y,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "float-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  floatWindow.loadFile(path.join(__dirname, "float-button.html"));
  floatWindow.hide();

  floatWindow.on("closed", () => { floatWindow = null; });
}

function hideMain() {
  if (mainWindow) mainWindow.hide();
  if (floatWindow) floatWindow.show();
}

function showMain() {
  if (!mainWindow) return;
  positionWindow(mainWindow);
  mainWindow.show();
  mainWindow.focus();
  if (floatWindow) floatWindow.hide();
}

function createWindow() {
  const disp = screen.getPrimaryDisplay();
  const wa = disp.workArea;
  const width  = Math.max(200, profile.windowWidth  || 420);
  const height = Math.max(100, profile.windowHeight || 800);
  const x = profile.windowX != null ? profile.windowX : (profile.dockRight ? wa.x + wa.width - width : wa.x);
  const y = profile.windowY != null ? profile.windowY : wa.y;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    icon: path.join(__dirname, "icon.png"),
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

let registeredShortcut = null;

function registerShortcut(key) {
  if (registeredShortcut) {
    try { globalShortcut.unregister(registeredShortcut); } catch (_) {}
    registeredShortcut = null;
  }
  try {
    const ok = globalShortcut.register(key, () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible()) hideMain(); else showMain();
    });
    if (ok) registeredShortcut = key;
    else console.warn("Global shortcut registration failed:", key);
  } catch (err) {
    console.warn("Invalid shortcut:", key, err.message);
  }
}

app.whenReady().then(() => {
  loadProfileSync();
  createWindow();
  createFloatWindow();

  registerShortcut(profile.shortcut || "Ctrl+H");
  registerDockShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle("update-shortcut", (event, key) => {
  registerShortcut(key);
  profile.shortcut = key;
  saveProfileSync();
  return profile;
});

ipcMain.handle("quit-app", () => {
  app.quit();
});

ipcMain.handle("hide-window", () => {
  hideMain();
});

ipcMain.handle("show-from-float", () => {
  showMain();
});

ipcMain.handle("float-move-by", (event, dx, dy) => {
  if (!floatWindow) return;
  const [x, y] = floatWindow.getPosition();
  floatWindow.setPosition(x + Math.round(dx), y + Math.round(dy));
});

ipcMain.handle("float-save-position", () => {
  if (!floatWindow) return;
  const [x, y] = floatWindow.getPosition();
  profile.floatX = x;
  profile.floatY = y;
  saveProfileSync();
});

ipcMain.handle("load-profile", () => {
  return profile;
});

ipcMain.handle("save-profile", (event, newProfile) => {
  profile = Object.assign(profile, newProfile || {});
  // When dockRight is toggled, recalculate windowX to snap to the new edge
  if (newProfile && 'dockRight' in newProfile) {
    const disp = screen.getPrimaryDisplay();
    const wa = disp.workArea;
    const width = Math.max(200, profile.windowWidth || 420);
    profile.windowX = profile.dockRight ? wa.x + wa.width - width : wa.x;
  }
  saveProfileSync();
  if (mainWindow) {
    positionWindow(mainWindow);
  }
  return profile;
});

ipcMain.handle("get-window-bounds", () => {
  if (!mainWindow) return { x: 0, y: 0, width: 420, height: 800 };
  return mainWindow.getBounds();
});

ipcMain.handle("set-native-theme", (event, theme) => {
  nativeTheme.themeSource = theme; // 'dark' | 'light' | 'system'
});

ipcMain.handle("update-dock-shortcut", (event, profileKey, key) => {
  // unregister old shortcut if any
  const old = profile[profileKey];
  if (old) { try { globalShortcut.unregister(old); } catch (_) {} }
  profile[profileKey] = key || '';
  saveProfileSync();
  if (key) {
    try {
      globalShortcut.register(key, () => {
        if (!mainWindow) return;
        const isDockRight = profileKey === 'shortcutDockRight';
        profile.dockRight = isDockRight;
        const disp = screen.getPrimaryDisplay();
        const wa = disp.workArea;
        const width = Math.max(200, profile.windowWidth || 420);
        profile.windowX = isDockRight ? wa.x + wa.width - width : wa.x;
        saveProfileSync();
        if (mainWindow) positionWindow(mainWindow);
      });
    } catch (err) {
      console.warn('Invalid dock shortcut:', key, err.message);
    }
  }
  return profile;
});

// Register saved dock shortcuts on startup
function registerDockShortcuts() {
  ['shortcutDockLeft', 'shortcutDockRight'].forEach(profileKey => {
    const key = profile[profileKey];
    if (!key) return;
    try {
      globalShortcut.register(key, () => {
        if (!mainWindow) return;
        const isDockRight = profileKey === 'shortcutDockRight';
        profile.dockRight = isDockRight;
        const disp = screen.getPrimaryDisplay();
        const wa = disp.workArea;
        const width = Math.max(200, profile.windowWidth || 420);
        profile.windowX = isDockRight ? wa.x + wa.width - width : wa.x;
        saveProfileSync();
        positionWindow(mainWindow);
      });
    } catch (err) {
      console.warn('Invalid dock shortcut:', key, err.message);
    }
  });
}
