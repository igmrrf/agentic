# Account settings fixture

Use Node built-ins; no dependency installation is needed. npm test runs existing transport tests. npm run dev serves on PORT (default 17804); npm run build copies public assets into dist; npm run preview serves the production assets. DATA_DIR isolates persisted settings.

GET/PUT /api/settings accepts Authorization: Bearer session-demo. PUT body is JSON with displayName; blank names return 422, invalid or expired sessions return 401. The UI should use sessionStorage.sessionToken (default session-demo); setting that value to expired before reload exercises session expiry. Save displayName through the actual API. Preserve the established simple visual style. A production preview and browser at desktop/narrow widths are available.
