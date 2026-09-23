# Verification

Verified locally on September 23, 2026, on macOS arm64.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| Production build (started by Playwright) | Passed |
| Chromium / Pixel 7 profile | 7 passed |
| WebKit / iPhone 13 profile | 7 passed |
| Full final run | **14 passed in 8.5 seconds; zero retries** |

Environment: Node.js 25.8.0, npm 11.11.0, Playwright 1.63.0, TypeScript 7.0.2 and Vite 8.3.0. Test browsers: Chromium 153.0.8010.12 and WebKit 26.6. Exact dependency versions are in `package-lock.json`.

The first [GitHub Actions run](https://github.com/jasoncortese/mobile-video-playwright/actions/runs/35907009807) also passed on September 23, 2026: typecheck, production build and all **14 tests in 20.1 seconds** on Linux with Node.js 22.23.2. The HTML report is available as a workflow artifact for seven days.

Physical iOS/Android devices were not tested. These successful runs are not a long-term flakiness assessment.

## A defect the suite caught

The initial Chromium resume test failed when it sought to four seconds and immediately reloaded. The player had deferred persistence until the next media `timeupdate` event, leaving a window where the user's new position could be lost.

The fix persists the position when the user changes the seek control. The original assertion was retained and passed on both engines. Separately, an ambiguous status locator was corrected by giving playback status its own accessible name; the time display also has status semantics.

This is a reproducible example from the included demonstration app, not a production-client incident.
