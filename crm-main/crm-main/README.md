# Employee CRM Chrome Extension (Vite + React + MV3)

This repository is a Chrome Extension scaffold implementing a client-centric CRM popup widget, Drive AppData sync, IndexedDB local storage, and a small background service worker.

Important: you must register an OAuth2 client in Google Cloud and replace the placeholder in `manifest.json` before publishing or local testing.

## Quick start (development)

1. Install dependencies:
   npm install

2. Set OAuth client ID:
   - Create credentials in Google Cloud Console (OAuth 2.0 Client IDs). For Chrome Extensions using chrome.identity, you should create an _OAuth client ID_ (Web application) and copy the client_id into `manifest.json` oauth2.client_id.
   - See: https://developer.chrome.com/docs/extensions/mv3/tut_oauth/

3. Run dev:
   npm run dev
   - Open the popup HTML path served by Vite, or build and load the extension from `dist`.

4. Build:
   npm run build
   - Load the `dist` directory as an unpacked extension in chrome://extensions (developer mode).

## Notes about OAuth & Drive AppData
- Use the OAuth client ID you created; ensure the extension is authorized in the API console.
- Scopes required: https://www.googleapis.com/auth/drive.appdata
- Use `chrome.identity.getAuthToken()` from extension to obtain short-lived token.

## Structure
- manifest.json — MV3 manifest (replace client id)
- popup/ — popup HTML & React app
- src/infra — auth, drive, backup helpers
- src/storage — IndexedDB wrapper (idb)
- background/ — service worker module
- public/privacy.html — privacy statement

## Security & MV3 compliance
- No inline scripts (popup/index.html loads a single module)
- Background is a service worker module
- All external calls use fetch with Authorization header
- Avoid `eval` or remote code

## Next steps to production
- Replace OAuth client ID, verify with Google Cloud
- Add app icons in `icons/` and update manifest
- Extend Drive sync algorithm (deltas/patching) and conflict handling (ETag/optimistic locking)
- Provide automated tests, CI, and reproducible build
- Optionally add code signing & publish to Chrome Web Store
