HTML OS — Minimal Prototype

What this contains:
- `index.html` — lock screen, blurred background, desktop and app icons
- `styles.css` — minimal, focused styles
- `script.js` — account creation, login, settings to change background, and double-click app opener

How to use:
1. Open `index.html` in a browser.
2. Default account: username `user`, password `password`.
3. Use **Create an account** to store credentials (saved in `localStorage`).
4. Settings → change background by uploading an image file or providing an image URL (saved to `localStorage`).
5. On lock screen the background is blurred for focus; when you login (correct password), the blur is removed and the desktop appears.
6. Double-click an icon to open a simple app window. The Settings icon opens the background settings as well.

Notes & next steps:
- Background images are persisted in `localStorage` (data URL or URL). You can replace the image later from Settings.
- This is intentionally simple; security is minimal (for prototype only).
- If you'd like I can: add keyboard shortcuts, support multiple apps, or add a real wallpaper picker UI.
