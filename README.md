
<p align="center">
  <img src="https://github.com/fajarnadril/GitDrive-Storage/blob/main/obbanner.png" alt="OverlayBrowser Banner" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.3.0-32CD32?style=flat-square" alt="Version">
  &nbsp;
  <img src="https://img.shields.io/badge/license-MIT-32CD32?style=flat-square&logo=mit&logoColor=white" alt="License">
  &nbsp;
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-6C757D?style=flat-square&logo=github&logoColor=white" alt="Platform">
</p>

---

<p align="center">
  <strong>Overlay Browser : Your AI companion's second screen — instant, always-on-top, zero distraction.</strong><br>
  <em>Global Shortcuts | Floating UI | Profile Persistence | Cross-Platform | Easy to Extend</em>
</p>

<p align="center">
  <a href="https://github.com/fajarnadril/OverlayBrowser/releases">
    <img src="https://img.shields.io/badge/⬇️%20Download-Latest%20Release-32CD32?style=for-the-badge&logo=github&logoColor=white" alt="Download Latest Release" height="50">
  </a>
</p>

<p align="center">
  <strong>English</strong>
</p>

<p align="center">
  <strong>💬 Community:</strong> <a href="https://github.com/fajarnadril/OverlayBrowser/discussions" target="_blank">GitHub Discussions</a> | <a href="https://github.com/fajarnadril/OverlayBrowser/issues" target="_blank">Report Issues</a> | <a href="https://github.com/fajarnadril" target="_blank">GitHub Profile</a>
</p>

---

## 📋 Quick Navigation

<p align="center">

[Overview](#overlay-browser---floating-ui-for-llm-integration) ·
[Features](#-features) ·
[Installation](#-installation) ·
[Usage](#-usage) ·
[Development](#-development) ·
[FAQ](#-faq) ·
[Contributing](#-contributing)

</p>

---

## Overlay Browser — Floating UI for LLM Integration

<p align="center">
  <img src="https://github.com/fajarnadril/GitDrive-Storage/raw/main/obfeatures.gif" alt="OverlayBrowser Feature Demo" width="800">
</p>

**OverlayBrowser is more than a simple browser.** It's a lightweight, proof-of-concept overlay tool designed for seamless LLM integration. Toggle a browser window instantly with global shortcuts, dock it conveniently, and persist profiles for quick access. Built with Electron for cross-platform compatibility.

|                                 | Traditional Browsers | **OverlayBrowser**                                                                                                           |
| :------------------------------ | :-------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| Overlay Mode                    | No                    | **Yes — floating overlay with global shortcut**                                                                               |
| Profile Persistence             | Limited               | **Yes — save URL, dock position automatically**                                                                               |
| Global Shortcuts                | No                    | **Yes — customizable keyboard shortcuts**                                                                                     |
| Lightweight                     | Varies                | **Yes — minimal footprint, fast startup**                                                                                     |
| Easy to Extend                  | Varies                | **Yes — clean Electron codebase**                                                                                             |


---

## ✨ Features

OverlayBrowser provides essential features for quick browser access alongside your LLM tools.

- **🎯 Global Shortcut Toggle** — Press `Super+O` (Win+O on Windows) to instantly show/hide the overlay from anywhere
- **📌 Floating UI** — Dock left/right, always-on-top for distraction-free access while you work
- **💾 Profile Persistence** — Automatically save and restore URL, dock position, and window state
- **⚙️ Easy Customization** — Modify shortcuts, profiles, and behavior via clean, well-organized code
- **🖥️ Cross-Platform** — Native support for Windows, macOS, and Linux
- **⚡ Lightweight** — Minimal footprint (~100MB), fast startup, efficient resource usage

**Key Files:**
- `main.js` — Main Electron process, global shortcut registration, window management
- `renderer.js` — Primary UI for the overlay browser
- `preload.js` / `float-preload.js` — Secure IPC bridges between renderer and main processes
- `float-button.html` / `float-renderer.js` — Floating overlay UI components
- `profiles.json` — Profile storage example and documentation

---

## 🚀 Installation

### System Requirements

- **Windows**: Windows 10 or higher
- **macOS**: 10.15 (Catalina) or higher
- **Linux**: Ubuntu 18.04+ / Debian 10+ / Fedora 32+
- **Memory**: 512MB+ recommended
- **Storage**: 100MB+ available space for installation

### Prerequisites

- **Node.js**: Version 14 LTS or higher
- **npm**: Comes with Node.js
- **Git**: Optional, for cloning the repository

### Quick Start (Development)

```bash
# Clone the repository
git clone https://github.com/fajarnadril/OverlayBrowser.git

# Navigate to project directory
cd OverlayBrowser

# Install dependencies
npm install

# Start the app in development mode
npm start
```

The `npm start` command launches the Electron app (`electron .`) with hot-reload capabilities, perfect for development and testing.

### Build for Distribution

```bash
# Build the app for your platform
npm run build
```

This generates an executable installer using `electron-builder`, configured in `package.json`. Artifacts are output to a `dist/` directory and are ready for distribution.

### 📖 Detailed Guides

<details>
<summary><strong>Expand to view build and configuration details</strong></summary>

<br>

**Build Configuration:**
- The build process uses `electron-builder` to create platform-specific installers
- On Windows: generates `.exe` portable executable
- On macOS: generates `.dmg` application bundle
- On Linux: generates `.AppImage` or `.deb` packages
- All files configured in `package.json` under the `build` section

**Environment Setup Tips:**
- Use Node Version Manager (nvm) for easy Node.js version switching
- On Windows, you may need Visual C++ build tools for some native modules
- Run `npm list` to verify dependency tree

</details>

---

## 💻 Usage

OverlayBrowser is designed to be intuitive and requires minimal configuration out of the box.

### Basic Operation

- **Toggle Overlay**: Press the global shortcut (`Super+O` / Win+O) to open or close the floating browser window
- **Dock Positioning**: Use the Dock button in the overlay to switch between left and right positioning
- **Load URL**: Type or paste any URL in the address bar to navigate
- **Persistent Profile**: Your current URL and dock position are automatically saved

### Profile Management

Profiles are stored in Electron's `userData` folder:
- **Windows**: `%APPDATA%\OverlayBrowser\`
- **macOS**: `~/Library/Application Support/OverlayBrowser/`
- **Linux**: `~/.config/OverlayBrowser/`

See `profiles.json` in the repository for an example profile structure.

### Customization

**Changing the Global Shortcut:**
1. Open `main.js` and locate the shortcut registration code (typically near the top)
2. Replace the shortcut string (e.g., `'Super+O'`) with your preferred combination
3. Restart the app (`npm start`)

Common shortcut formats: `Ctrl+Shift+X`, `Alt+Z`, `CmdOrCtrl+U`

<details>
<summary><strong>View shortcut conflict troubleshooting</strong></summary>

<br>

If your chosen shortcut conflicts with system or application shortcuts:
- **Windows**: Check Settings → Keyboard Shortcuts for reserved keys
- **macOS**: System Preferences → Keyboard → Shortcuts
- **Linux**: Varies by desktop environment; check your WM/DE documentation

</details>

---

## 👨‍💻 Development

OverlayBrowser is designed with clean, extensible architecture. Perfect for learning Electron or building custom overlays.

### Project Architecture

**Main Process** (`main.js`):
- Initializes Electron app
- Registers global shortcuts
- Manages window lifecycle and state persistence
- Handles IPC communication with renderer processes

**Renderer Process** (`renderer.js`):
- Primary overlay browser UI
- Handles navigation and URL input
- Manages profile loading/saving via IPC

**Preload Bridges** (`preload.js`, `float-preload.js`):
- Secure context bridges between main and renderer
- Exposes safe API methods to renderer processes
- Implements principle of least privilege

**Floating UI** (`float-button.html`, `float-renderer.js`):
- Separate floating window UI
- Dock positioning controls
- Minimize/close button functionality

### Development Workflow

```bash
# Start development server with auto-reload
npm start

# Open DevTools for debugging (Ctrl+Shift+I on the app window)
# Make changes to source files
# App automatically reloads on save
```

### Debugging Tips

- **DevTools**: Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (macOS) to open developer tools
- **Console Logging**: Logs from both main and renderer processes appear in DevTools
- **Performance**: Use DevTools Performance tab to profile rendering and startup time
- **Network**: DevTools Network tab shows all network requests made by the overlay

### Production Considerations

For production deployment, consider:
- ✅ Implementing code signing for macOS and Windows
- ✅ Adding auto-update mechanism using `electron-updater`
- ✅ Implementing security headers and CSP policies
- ✅ Adding crash reporting with services like Sentry
- ✅ Implementing telemetry opt-in (not opt-out)
- ✅ Hardening IPC communication between processes

---

## ❓ FAQ

<details>
<summary><strong>Q: Why is this called a "Proof-of-Concept"?</strong></summary>
A: OverlayBrowser is a PoC designed to demonstrate the core concept of a floating, persistent overlay browser. It's production-ready for personal use but may need enhancements for enterprise deployment (security hardening, update mechanisms, telemetry, etc.).
</details>

<details>
<summary><strong>Q: Can I use OverlayBrowser alongside my LLM tools?</strong></summary>
A: Yes! That's the primary use case. The global shortcut allows you to quickly toggle the browser while working with any LLM, IDE, or application. It's designed to be non-intrusive.
</details>

<details>
<summary><strong>Q: How do I customize the keyboard shortcut?</strong></summary>
A: Edit `main.js` and change the shortcut registration string. Common formats: `'Ctrl+Shift+X'`, `'Alt+Z'`, `'CmdOrCtrl+U'`. See the Development section for details.
</details>

<details>
<summary><strong>Q: Is my data secure? Where are profiles stored?</strong></summary>
A: Profiles are stored locally in Electron's `userData` folder on your machine. No data is uploaded to any server. All IPC communication between processes is isolated and secure.
</details>

<details>
<summary><strong>Q: Can I extend OverlayBrowser with custom features?</strong></summary>
A: Absolutely! The codebase is clean and well-structured. You can add features like:
- Custom toolbar buttons and integrations
- Additional keyboard shortcuts
- Profile sync to cloud storage
- Plugins or extensions system
- Custom CSS theming

Start by modifying `renderer.js` or `float-renderer.js` to add new features.
</details>

<details>
<summary><strong>Q: Does OverlayBrowser work offline?</strong></summary>
A: The overlay browser itself works offline. You can still use it to view local HTML files or previously loaded content. However, navigating to online URLs will fail without internet connectivity.
</details>

<details>
<summary><strong>Q: What's the performance impact?</strong></summary>
A: OverlayBrowser has minimal resource footprint (~50-100MB RAM depending on loaded content). Global shortcuts are registered at OS level with negligible CPU impact. The overlay window only renders when visible.
</details>

---

## 🤝 Contributing

Thanks for considering contributing to OverlayBrowser! We welcome all kinds of contributions.

### How to Contribute

1. **Fork** the repository on GitHub
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Make** your changes with clear, descriptive commits
4. **Test** your changes locally with `npm start`
5. **Push** to your fork: `git push origin feature/your-feature-name`
6. **Open** a Pull Request with a clear description of your changes

### Contribution Guidelines

- Include a short description of what you're adding or fixing
- Add reproduction steps if fixing a bug
- Include screenshots for UI changes
- Keep commits focused and atomic
- Follow the existing code style and structure
- Test on at least one platform (Windows/macOS/Linux) if possible

### Development Setup for Contributors

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OverlayBrowser.git
cd OverlayBrowser

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/my-feature

# Make changes and test
npm start

# When ready, push and create a PR
git push origin feature/my-feature
```

### Areas for Contribution

- 🐛 Bug fixes and issue resolution
- 🎨 UI/UX improvements
- 📚 Documentation and guides
- 🌍 Translations and internationalization
- ⚡ Performance optimizations
- 🔒 Security improvements
- ✨ New features and enhancements

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

The MIT License allows you to use, modify, and distribute OverlayBrowser freely for personal and commercial purposes.

---

## 👥 Community & Support

- **GitHub Discussions**: Share ideas and ask questions in [Discussions](https://github.com/fajarnadril/OverlayBrowser/discussions)
- **Issues**: Report bugs and request features via [Issues](https://github.com/fajarnadril/OverlayBrowser/issues)
- **Releases**: Download latest version from [Releases](https://github.com/fajarnadril/OverlayBrowser/releases)

---

## 🙋 About

**Owner / Maintainer**: [fajarnadril](https://github.com/fajarnadril)

OverlayBrowser is an open-source project created to explore Electron capabilities and provide a simple, useful tool for LLM integration workflows.

If you find this project helpful, consider:
- ⭐ Giving it a star on GitHub
- 🔄 Sharing it with others
- 💬 Providing feedback and suggestions
- 🤝 Contributing improvements

---

<div align="center">

**Have a question or suggestion?** [Open an issue](https://github.com/fajarnadril/OverlayBrowser/issues) or [start a discussion](https://github.com/fajarnadril/OverlayBrowser/discussions)


</div>




