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
  syncFloatToMain();
}

const FLOAT_W = 64;

// Determine which corner of the screen the float button is in
function getScreenCorner(fx, fy) {
  const wa = screen.getPrimaryDisplay().workArea;
  return {
    right:  (fx + FLOAT_W / 2) >= wa.x + wa.width  / 2,
    bottom: (fy + FLOAT_W / 2) >= wa.y + wa.height / 2,
  };
}

// Float button position derived from browser bounds + stored corner preference
function floatPosFromBrowser(bx, by, bw, bh) {
  const right  = profile.floatCornerRight  !== false; // default: right
  const bottom = profile.floatCornerBottom !== false; // default: bottom
  return {
    x: Math.round(right  ? bx + bw - FLOAT_W / 2 : bx - FLOAT_W / 2),
    y: Math.round(bottom ? by + bh - FLOAT_W / 2 : by - FLOAT_W / 2),
  };
}

// Browser top-left derived from float button position, using screen quadrant to detect corner
function browserPosFromFloat(fx, fy, bw, bh) {
  const { right, bottom } = getScreenCorner(fx, fy);
  profile.floatCornerRight  = right;
  profile.floatCornerBottom = bottom;
  return {
    x: Math.round(right  ? fx - bw + FLOAT_W / 2 : fx + FLOAT_W / 2),
    y: Math.round(bottom ? fy - bh + FLOAT_W / 2 : fy + FLOAT_W / 2),
  };
}

function syncFloatToMain() {
  if (!floatWindow || !mainWindow) return;
  const { x, y, width, height } = mainWindow.getBounds();
  const fp = floatPosFromBrowser(x, y, width, height);
  floatWindow.setPosition(fp.x, fp.y);
}

function createFloatWindow() {
  const disp = screen.getPrimaryDisplay();
  const wa = disp.workArea;
  const fw = FLOAT_W, fh = FLOAT_W;
  // Initial position: derived from browser bounds if available, else default bottom-right
  let x = wa.x + wa.width - fw / 2;
  let y = wa.y + wa.height - fh / 2;
  if (mainWindow) {
    const b = mainWindow.getBounds();
    const fp = floatPosFromBrowser(b.x, b.y, b.width, b.height);
    x = fp.x; y = fp.y;
  }

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
  // Always visible at 'floating' level — main window sits above it at 'screen-saver' level
  floatWindow.setAlwaysOnTop(true, 'floating');
  floatWindow.show();

  floatWindow.on("closed", () => { floatWindow = null; });
}

function hideMain() {
  if (mainWindow) mainWindow.minimize();
  // float button is always visible — no need to show/hide it
}

function showMain() {
  if (!mainWindow) return;
  positionWindow(mainWindow);
  mainWindow.show();
  mainWindow.focus();
  // float button stays visible underneath
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
    skipTaskbar: false,
    resizable: true,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      spellcheck: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // Main window at higher always-on-top level so it appears above the float button
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Auto-save window position & size on move/resize (debounced)
  let saveTimeout;
  let boundsThrottleTimeout;
  const scheduleSaveBounds = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (!mainWindow) return;
      const { x, y, width, height } = mainWindow.getBounds();
      profile.windowX = x;
      profile.windowY = y;
      profile.windowWidth = width;
      profile.windowHeight = height;
      saveProfileSync();
    }, 300); // save after 300ms of inactivity
  };
  const sendBoundsThrottled = () => {
    if (boundsThrottleTimeout) return;
    boundsThrottleTimeout = setTimeout(() => {
      boundsThrottleTimeout = null;
      if (!mainWindow) return;
      mainWindow.webContents.send('window-bounds-changed', mainWindow.getBounds());
      syncFloatToMain();
    }, 100); // max 10 updates/sec
  };
  mainWindow.on("move", () => {
    scheduleSaveBounds();
    sendBoundsThrottled();
  });
  mainWindow.on("resize", () => {
    scheduleSaveBounds();
    sendBoundsThrottled();
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
      if (mainWindow.isVisible() && !mainWindow.isMinimized()) hideMain(); else showMain();
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
  createFloatWindow(); // always visible as persistent floating button

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
  if (!mainWindow) return;
  // Toggle: if browser is visible, hide it; otherwise show it
  if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
    hideMain();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  const width  = Math.max(200, profile.windowWidth  || 420);
  const height = Math.max(100, profile.windowHeight || 800);
  // Compute browser position from current float button position
  if (floatWindow) {
    const [fx, fy] = floatWindow.getPosition();
    const disp = screen.getPrimaryDisplay();
    const wa = disp.workArea;
    const bp = browserPosFromFloat(fx, fy, width, height);
    profile.windowX = Math.min(Math.max(bp.x, wa.x), wa.x + wa.width - width);
    profile.windowY = Math.min(Math.max(bp.y, wa.y), wa.y + wa.height - height);
  }
  mainWindow.setBounds({ x: profile.windowX, y: profile.windowY, width, height });
  mainWindow.show();
  mainWindow.focus();
});

ipcMain.handle("float-move-by", (event, dx, dy) => {
  if (!floatWindow) return;
  const [fx, fy] = floatWindow.getPosition();
  const newFx = fx + Math.round(dx);
  const newFy = fy + Math.round(dy);
  floatWindow.setPosition(newFx, newFy);

  // Derive browser position from new float position and save to profile
  const width  = Math.max(200, profile.windowWidth  || 420);
  const height = Math.max(100, profile.windowHeight || 800);
  const disp = screen.getPrimaryDisplay();
  const wa = disp.workArea;
  const bp = browserPosFromFloat(newFx, newFy, width, height);
  profile.windowX = Math.min(Math.max(bp.x, wa.x), wa.x + wa.width - width);
  profile.windowY = Math.min(Math.max(bp.y, wa.y), wa.y + wa.height - height);
});

ipcMain.handle("float-save-position", () => {
  // Browser position already saved in profile via float-move-by
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
