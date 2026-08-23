# PWA Implementation Spec for Budgetly

## 1. Overview
Convert the existing Budgetly web application into an installable, standalone Progressive Web App (PWA) using `vite-plugin-pwa` without altering existing backend APIs, business logic, React architecture, or routing.

## 2. Configuration & Manifest
- **Plugin**: `vite-plugin-pwa` installed as dev dependency in `client`.
- **Configuration** in `client/vite.config.js`:
  - `registerType`: `'autoUpdate'`
  - `manifest`:
    - `name`: "بدجتلي - إدارة الميزانية"
    - `short_name`: "Budgetly"
    - `description`: "تطبيق ذكي وبسيط لإدارة المصاريف والميزانية المشتركة"
    - `start_url`: "/"
    - `scope`: "/"
    - `display`: "standalone"
    - `orientation`: "portrait"
    - `theme_color`: "#ca8a04"
    - `background_color`: "#ffffff"
    - `icons`:
      - `src: '/web-app-manifest-192x192.png'`, `sizes: '192x192'`, `type: 'image/png'`, `purpose: 'any maskable'`
      - `src: '/web-app-manifest-512x512.png'`, `sizes: '512x512'`, `type: 'image/png'`, `purpose: 'any maskable'`

## 3. Caching & Service Worker Policy
- Workbox precaches static assets (HTML, CSS, JS, fonts, static images).
- All network requests targeting `/api/` or backend routes will be excluded from caching to avoid serving stale or sensitive financial data.
- Service worker self-updates automatically in the background when a new deployment is detected.

## 4. Mobile UX & Viewport
- Set `viewport-fit=cover` in `index.html`.
- Add `theme-color` for light (`#ca8a04`) and dark (`#0b0b0d`) modes.
- Ensure safe area insets on mobile top and bottom navigation bars.

## 5. Verification & Testing
- Build app with `npm --prefix client run build`.
- Verify manifest validity and service worker generation in `dist/`.
- Test local preview using `npm --prefix client run preview`.
