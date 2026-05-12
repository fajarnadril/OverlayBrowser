document.addEventListener('DOMContentLoaded', async () => {
  const activeProfileName = document.getElementById('active-profile-name');
  const dockBtn       = document.getElementById('dock');
  const hideBtn       = document.getElementById('hide');
  const settingsBtn   = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings');
  const webview       = document.getElementById('wv');
  const profileList   = document.getElementById('profile-list');
  const newNameInput  = document.getElementById('new-name');
  const newUrlInput   = document.getElementById('new-url');
  const addProfileBtn = document.getElementById('add-profile-btn');
  const winWidthInput = document.getElementById('win-width');
  const winHeightInput= document.getElementById('win-height');
  const winXInput     = document.getElementById('win-x');
  const winYInput     = document.getElementById('win-y');
  const saveSizeBtn   = document.getElementById('save-size-btn');
  const saveAllBtn    = document.getElementById('save-all-btn');
  const saveStatus    = document.getElementById('save-status');
  const closeAppBtn   = document.getElementById('close-app');
  // appearance
  const uiColorInp     = document.getElementById('ui-color');
  const uiOpacityInp   = document.getElementById('ui-opacity');
  const uiOpacityVal   = document.getElementById('ui-opacity-val');
  const uiBlurInp      = document.getElementById('ui-blur');
  const uiBlurVal      = document.getElementById('ui-blur-val');
  const uiAccentInp    = document.getElementById('ui-accent');
  const themePreview   = document.getElementById('theme-preview');
  const transparencyInp = document.getElementById('transparency');
  const transparencyVal = document.getElementById('transparency-val');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon      = document.getElementById('theme-icon');
  // shortcut
  const shortcutRecorder    = document.getElementById('shortcut-recorder');
  const saveShortcutBtn     = document.getElementById('save-shortcut-btn');
  const shortcutStatus      = document.getElementById('shortcut-status');
  const shortcutClearBtn    = document.getElementById('shortcut-clear');
  const shortcutDockLeft    = document.getElementById('shortcut-dock-left');
  const shortcutDockRight   = document.getElementById('shortcut-dock-right');
  const shortcutDockLClear  = document.getElementById('shortcut-dock-left-clear');
  const shortcutDockRClear  = document.getElementById('shortcut-dock-right-clear');

  let profile = await window.electronAPI.loadProfile();

  // Listen for real-time window bounds changes
  window.electronAPI.onWindowBoundsChanged((bounds) => {
    if (settingsPanel.classList.contains('open')) {
      winXInput.value = bounds.x;
      winYInput.value = bounds.y;
      winWidthInput.value = bounds.width;
      winHeightInput.value = bounds.height;
    }
  });

  // Seed default URL profiles if none exist
  if (!Array.isArray(profile.urlProfiles) || profile.urlProfiles.length === 0) {
    profile.urlProfiles = [
      { name: 'DeepSeek', url: 'https://chat.deepseek.com' },
    ];
    profile = await window.electronAPI.saveProfile({ urlProfiles: profile.urlProfiles });
  }

  const currentUrl = profile.url || 'https://chat.deepseek.com';
  webview.src = currentUrl;
  updateDockBtn();
  updateProfileLabel();
  const _initT = profile.transparency ?? Math.round(100 - (profile.webOpacity ?? 100));
  applyTheme(profile.uiColor || '#141416', Math.max(5, 98 - _initT), profile.uiBlur ?? 18, profile.uiAccent || '#63b3ed');
  applyWebOpacity(Math.max(10, 100 - _initT));
  applyUiTheme(profile.uiTheme || 'dark');
  window.electronAPI.setNativeTheme(profile.uiTheme || 'dark');

  function updateProfileLabel() {
    const match = (profile.urlProfiles || []).find(p => p.url === profile.url);
    activeProfileName.textContent = match ? match.name : 'Custom';
  }

  // ── Profile Panel ─────────────────────────────────────────
  const profilePanel      = document.getElementById('profile-panel');
  const profilePanelClose = document.getElementById('profile-panel-close');
  const profilePickerList = document.getElementById('profile-picker-list');

  function renderProfilePicker() {
    profilePickerList.innerHTML = '';
    (profile.urlProfiles || []).forEach(p => {
      const item = document.createElement('div');
      item.className = 'p-item' + (p.url === profile.url ? ' active' : '');
      const nameSpan = document.createElement('span');
      nameSpan.className = 'p-name';
      nameSpan.textContent = p.name;
      const urlSpan = document.createElement('span');
      urlSpan.className = 'p-url';
      urlSpan.textContent = p.url;
      item.appendChild(nameSpan);
      item.appendChild(urlSpan);
      item.addEventListener('click', async () => {
        profilePanel.classList.remove('open');
        if (p.url === profile.url) return;
        webview.src = p.url;
        profile = await window.electronAPI.saveProfile({ url: p.url });
        updateProfileLabel();
      });
      profilePickerList.appendChild(item);
    });
  }

  document.getElementById('profile-btn').addEventListener('click', () => {
    if (settingsPanel.classList.contains('open')) settingsPanel.classList.remove('open');
    renderProfilePicker();
    profilePanel.classList.toggle('open');
  });

  profilePanelClose.addEventListener('click', () => {
    profilePanel.classList.remove('open');
  });

  function applyUiTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // swap icon: moon = dark mode, sun = light mode
    if (theme === 'light') {
      themeIcon.innerHTML = '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="12" x2="4" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>';
      themeToggleBtn.title = 'Switch to dark mode';
    } else {
      themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
      themeToggleBtn.title = 'Switch to light mode';
    }
  }

  themeToggleBtn.addEventListener('click', async () => {
    const next = (profile.uiTheme || 'dark') === 'dark' ? 'light' : 'dark';
    profile = await window.electronAPI.saveProfile({ uiTheme: next });
    applyUiTheme(next);
    window.electronAPI.setNativeTheme(next);
  });

  // ── Dock toggle ──────────────────────────────────────────────
  dockBtn.addEventListener('click', async () => {
    profile = await window.electronAPI.saveProfile({ dockRight: !profile.dockRight });
    updateDockBtn();
  });

  function updateDockBtn() {
    const icon = document.getElementById('dock-icon');
    if (profile.dockRight) {
      dockBtn.title = 'Docked right — click to dock left';
      icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" stroke-width="1.5"/>';
    } else {
      dockBtn.title = 'Docked left — click to dock right';
      icon.innerHTML = '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" stroke-width="1.5"/>';
    }
  }

  // ── Hide / Close ────────────────────────────────────────────
  hideBtn.addEventListener('click', () => window.electronAPI.hideWindow());
  closeAppBtn.addEventListener('click', () => window.electronAPI.quitApp());

  // ── Keyboard shortcuts ───────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (settingsPanel.classList.contains('open')) {
        settingsPanel.classList.remove('open');
      } else if (profilePanel.classList.contains('open')) {
        profilePanel.classList.remove('open');
      } else {
        window.electronAPI.hideWindow();
      }
    }
  });

  // ── Settings panel ───────────────────────────────────────────
  settingsBtn.addEventListener('click', async () => {
    const isOpen = settingsPanel.classList.toggle('open');
    if (isOpen) {
      const b = await window.electronAPI.getWindowBounds();
      winXInput.value      = b.x;
      winYInput.value      = b.y;
      winWidthInput.value  = b.width;
      winHeightInput.value = b.height;
      // populate appearance controls from current profile
      const c = profile.uiColor   || '#141416';
      const o = profile.uiOpacity ?? 72;
      const bl= profile.uiBlur    ?? 18;
      const a = profile.uiAccent  || '#63b3ed';
      uiColorInp.value   = c;
      uiOpacityInp.value = 72;
      uiOpacityVal.textContent = '72%';
      uiBlurInp.value    = bl;
      uiBlurVal.textContent   = bl + 'px';
      uiAccentInp.value  = a;
      const t = profile.transparency ?? Math.round(100 - (profile.webOpacity ?? 100));
      transparencyInp.value = t;
      transparencyVal.textContent = t + '%';
      updatePreview(c, Math.max(5, 98 - t), bl);
      shortcutRecorder.textContent = profile.shortcut || 'Ctrl+H';
      shortcutDockLeft.textContent  = profile.shortcutDockLeft  || '—';
      shortcutDockRight.textContent = profile.shortcutDockRight || '—';
      renderProfileList();
      renderPresetChips();
    }
  });

  // ── URL Profiles ─────────────────────────────────────────────
  function renderProfileList() {
    profileList.innerHTML = '';
    (profile.urlProfiles || []).forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'p-item' + (p.url === profile.url ? ' active' : '');
      item.innerHTML = `
        <span class="p-name">${escHtml(p.name)}</span>
        <span class="p-url">${escHtml(p.url)}</span>
        <button class="p-del" title="Delete">×</button>
      `;
      item.addEventListener('click', async (e) => {
        if (e.target.classList.contains('p-del')) return;
        webview.src = p.url;
        profile = await window.electronAPI.saveProfile({ url: p.url });
        updateProfileLabel();
        renderProfileList();
      });
      item.querySelector('.p-del').addEventListener('click', async () => {
        profile.urlProfiles.splice(i, 1);
        profile = await window.electronAPI.saveProfile({ urlProfiles: profile.urlProfiles });
        renderProfileList();
      });
      profileList.appendChild(item);
    });
  }

  addProfileBtn.addEventListener('click', async () => {
    const name = newNameInput.value.trim();
    let   url  = newUrlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    profile.urlProfiles = profile.urlProfiles || [];
    profile.urlProfiles.push({ name, url });
    profile = await window.electronAPI.saveProfile({ urlProfiles: profile.urlProfiles });
    newNameInput.value = '';
    newUrlInput.value  = '';
    renderProfileList();
  });

  // ── Window Size & Position ────────────────────────────────────
  async function applyBounds() {
    const w = Math.max(200, parseInt(winWidthInput.value)  || 420);
    const h = Math.max(100, parseInt(winHeightInput.value) || 800);
    const x = parseInt(winXInput.value);
    const y = parseInt(winYInput.value);
    profile = await window.electronAPI.saveProfile({
      windowWidth: w, windowHeight: h,
      windowX: isNaN(x) ? null : x,
      windowY: isNaN(y) ? null : y,
    });
    winWidthInput.value  = w;
    winHeightInput.value = h;
  }

  saveSizeBtn.addEventListener('click', applyBounds);

  // ── Appearance ────────────────────────────────────────────────
  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#',''), 16);
    return `${(n>>16)&255}, ${(n>>8)&255}, ${n&255}`;
  }

  function applyWebOpacity(val) {
    webview.style.opacity = (val / 100).toFixed(2);
  }

  function applyTheme(color, opacity, blur, accent) {
    const root = document.documentElement;
    root.style.setProperty('--bg-rgb',       hexToRgb(color));
    root.style.setProperty('--bg-opacity',   (opacity / 100).toFixed(2));
    root.style.setProperty('--bg-opacity-2', (opacity * 0.82 / 100).toFixed(2));
    root.style.setProperty('--blur',         blur + 'px');
    root.style.setProperty('--accent-rgb',   hexToRgb(accent));
  }

  function updatePreview(color, opacity, blur) {
    themePreview.style.background =
      `linear-gradient(90deg, rgba(${hexToRgb(color)},${(opacity/100).toFixed(2)}), rgba(${hexToRgb(color)},${(opacity*0.82/100).toFixed(2)}))`;
    themePreview.style.backdropFilter = `blur(${blur}px)`;
  }

  // live preview on change
  uiColorInp.addEventListener('input', () => {
    const t = +transparencyInp.value;
    applyTheme(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value, uiAccentInp.value);
    updatePreview(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value);
  });
  uiAccentInp.addEventListener('input', () => {
    const t = +transparencyInp.value;
    applyTheme(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value, uiAccentInp.value);
  });
  uiOpacityInp.addEventListener('input', () => {
    uiOpacityVal.textContent = uiOpacityInp.value + '%';
    const t = +transparencyInp.value;
    applyTheme(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value, uiAccentInp.value);
    updatePreview(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value);
  });
  uiBlurInp.addEventListener('input', () => {
    uiBlurVal.textContent = uiBlurInp.value + 'px';
    const t = +transparencyInp.value;
    applyTheme(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value, uiAccentInp.value);
    updatePreview(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value);
  });
  transparencyInp.addEventListener('input', () => {
    const t = +transparencyInp.value;
    transparencyVal.textContent = t + '%';
    applyTheme(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value, uiAccentInp.value);
    applyWebOpacity(Math.max(10, 100 - t));
    updatePreview(uiColorInp.value, Math.max(5, 98 - t), +uiBlurInp.value);
  });

  // ── Save All Settings ─────────────────────────────────────────
  saveAllBtn.addEventListener('click', async () => {
    await applyBounds();
    profile = await window.electronAPI.saveProfile({
      uiColor:      uiColorInp.value,
      uiBlur:       +uiBlurInp.value,
      uiAccent:     uiAccentInp.value,
      transparency: +transparencyInp.value,
    });
    saveStatus.textContent = '✓ Saved';
    saveStatus.style.opacity = '1';
    clearTimeout(saveStatus._t);
    saveStatus._t = setTimeout(() => { saveStatus.style.opacity = '0'; }, 1800);
  });

  // ── Shortcut Recorder ─────────────────────────────────────────
  let isRecording = false;
  let pendingShortcut = null;

  function buildAccelerator(e) {
    const parts = [];
    if (e.ctrlKey)  parts.push('Ctrl');
    if (e.altKey)   parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey)  parts.push('Super');

    const key = e.key;
    if (['Control','Alt','Shift','Meta','OS'].includes(key)) return null;

    const keyMap = {
      ' ': 'Space', 'ArrowUp': 'Up', 'ArrowDown': 'Down',
      'ArrowLeft': 'Left', 'ArrowRight': 'Right',
      'Enter': 'Return', 'Backspace': 'Backspace', 'Delete': 'Delete',
      'Tab': 'Tab', 'Home': 'Home', 'End': 'End',
      'PageUp': 'PageUp', 'PageDown': 'PageDown', 'Insert': 'Insert',
    };
    let keyStr = keyMap[key];
    if (!keyStr) {
      if (key.length === 1) keyStr = key.toUpperCase();
      else if (/^F\d+$/.test(key)) keyStr = key;
      else return null;
    }
    parts.push(keyStr);
    return parts.join('+');
  }

  shortcutRecorder.addEventListener('click', () => {
    isRecording = true;
    pendingShortcut = null;
    shortcutRecorder.textContent = 'Press shortcut...';
    shortcutRecorder.classList.add('recording');
    shortcutRecorder.focus();
  });

  shortcutRecorder.addEventListener('keydown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRecording) return;
    if (e.key === 'Escape') {
      isRecording = false;
      shortcutRecorder.classList.remove('recording');
      shortcutRecorder.textContent = profile.shortcut || 'Ctrl+H';
      return;
    }
    const accel = buildAccelerator(e);
    if (!accel) return;
    pendingShortcut = accel;
    isRecording = false;
    shortcutRecorder.classList.remove('recording');
    shortcutRecorder.textContent = accel;
  });

  shortcutRecorder.addEventListener('blur', () => {
    if (isRecording) {
      isRecording = false;
      shortcutRecorder.classList.remove('recording');
      shortcutRecorder.textContent = profile.shortcut || 'Ctrl+H';
    }
  });

  shortcutClearBtn.addEventListener('click', () => {
    pendingShortcut = null;
    isRecording = false;
    shortcutRecorder.classList.remove('recording');
    shortcutRecorder.textContent = profile.shortcut || 'Ctrl+H';
  });

  saveShortcutBtn.addEventListener('click', async () => {
    const key = pendingShortcut || shortcutRecorder.textContent;
    if (!key || key === 'Press shortcut...') return;
    profile = await window.electronAPI.updateShortcut(key);
    pendingShortcut = null;
    shortcutStatus.textContent = '✓ Applied';
    shortcutStatus.style.opacity = '1';
    clearTimeout(shortcutStatus._t);
    shortcutStatus._t = setTimeout(() => { shortcutStatus.style.opacity = '0'; }, 1800);
  });

  // dock shortcut recorders (reuse same buildAccelerator)
  function makeDockRecorder(el, clearBtn, profileKey, ipcAction) {
    let isRec = false;
    let pending = null;
    el.addEventListener('click', () => {
      isRec = true; pending = null;
      el.textContent = 'Press shortcut...';
      el.classList.add('recording');
      el.focus();
    });
    el.addEventListener('keydown', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!isRec) return;
      if (e.key === 'Escape') {
        isRec = false; el.classList.remove('recording');
        el.textContent = profile[profileKey] || '—';
        return;
      }
      const accel = buildAccelerator(e);
      if (!accel) return;
      pending = accel; isRec = false;
      el.classList.remove('recording');
      el.textContent = accel;
    });
    el.addEventListener('blur', () => {
      if (isRec) { isRec = false; el.classList.remove('recording'); el.textContent = profile[profileKey] || '—'; }
    });
    clearBtn.addEventListener('click', async () => {
      pending = null; isRec = false;
      el.classList.remove('recording');
      el.textContent = '—';
      profile = await window.electronAPI.updateDockShortcut(profileKey, '');
    });
    // wire into save-shortcut-btn
    saveShortcutBtn.addEventListener('click', async () => {
      const k = pending;
      if (!k) return;
      profile = await window.electronAPI.updateDockShortcut(profileKey, k);
      pending = null;
    });
  }
  makeDockRecorder(shortcutDockLeft,  shortcutDockLClear, 'shortcutDockLeft',  'dock-left');
  makeDockRecorder(shortcutDockRight, shortcutDockRClear, 'shortcutDockRight', 'dock-right');

  // ── Helpers ───────────────────────────────────────────────────
  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Preset Chips ──────────────────────────────────────────────
  const PRESETS = [
    { name: 'ChatGPT',  url: 'https://chatgpt.com' },
    { name: 'Claude',   url: 'https://claude.ai' },
    { name: 'Gemini',   url: 'https://gemini.google.com' },
    { name: 'DeepSeek', url: 'https://chat.deepseek.com' },
    { name: 'Qwen',     url: 'https://chat.qwen.ai' },
    { name: 'Kimi',     url: 'https://kimi.moonshot.cn' },
    { name: 'MiniMax',  url: 'https://hailuoai.com' },
    { name: 'StepFun',  url: 'https://stepchat.cn' },
  ];

  function renderPresetChips() {
    const chips = document.querySelectorAll('#preset-chips .preset-chip');
    chips.forEach(chip => {
      const url = chip.dataset.url;
      const exists = (profile.urlProfiles || []).some(p => p.url === url);
      chip.classList.toggle('exists', exists);
      chip.disabled = exists;
    });
  }

  document.getElementById('preset-chips').addEventListener('click', async (e) => {
    const chip = e.target.closest('.preset-chip');
    if (!chip || chip.disabled) return;
    const name = chip.dataset.name;
    const url  = chip.dataset.url;
    profile.urlProfiles = profile.urlProfiles || [];
    if (profile.urlProfiles.some(p => p.url === url)) return;
    profile.urlProfiles.push({ name, url });
    profile = await window.electronAPI.saveProfile({ urlProfiles: profile.urlProfiles });
    renderProfileList();
    renderPresetChips();
  });

  renderProfileList();
  renderPresetChips();
});