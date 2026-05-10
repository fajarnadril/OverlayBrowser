Electron PoC for OverlayBrowserForYourFavoriteLLM

Prerequisites:
- Node.js (LTS recommended)

Install & run:
1. cd to project root
2. npm install
3. npm start

Behavior:
- Global shortcut: Win + O (registered as 'Super+O') toggles overlay
- Dock left/right via the Dock button
- Profile (URL and dock side) persisted to Electron userData (e.g., %APPDATA% on Windows) as profiles.json

Notes:
- If the Super+O shortcut conflicts with system shortcuts, edit main.js and change the registration string.
- This is a PoC. Improve security, opt-in telemetry, and packaging for production.
