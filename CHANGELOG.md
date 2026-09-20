# 777 Neon Nights — CHANGELOG

## nn777-v4 (2026-09-20)
- Install UI: custom "Install" button (captures `beforeinstallprompt` on Android/desktop Chrome/Edge) plus an iOS guided walkthrough (Share → Add to Home Screen → open from home screen), all translated into the 41 supported languages from the player's selected language.
- Payout: added verified YouTube option (That Boy Hi Hat - Topic video). Tidal pending a verified direct track URL — will not ship a guessed link.
- Audio: explicit `touchstart` unlock in addition to `pointerdown`; interruption resume now retries play up to 5 times after returning from background; playback-state diagnostics on `window.__nnAudioState`.
- PWA: dedicated 180×180 Apple touch icon; manifest now lists normal + maskable icon coverage.
- Cache version bumped; `skipWaiting`/`clients.claim` and the update toast unchanged.

## nn777-v3 (2026-09-20)
- Three.js rebuild; hardened service worker (never caches non-ok responses, non-atomic install, version handshake, update toast); boot-retry panel; boot watchdog.
