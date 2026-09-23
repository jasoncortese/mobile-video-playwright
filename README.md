# Mobile video · Playwright sample

[![Mobile video checks](https://github.com/jasoncortese/mobile-video-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/jasoncortese/mobile-video-playwright/actions/workflows/playwright.yml)

A compact TypeScript suite for a mobile web video player. Seven behavior-focused scenarios run on Chromium with a Pixel 7 profile and WebKit with an iPhone 13 profile.

**Independent demonstration project.** Built as a portfolio sample, not a claim of client work or production testing. The accompanying player is a test target, not a production streaming platform.

## Run

Requires Node.js 22.12+ and a supported Playwright host.

```sh
npm ci
npx playwright install chromium webkit
npm run typecheck
npm test
npm run report
```

On Linux, use `npx playwright install --with-deps chromium webkit` to include system libraries. Playwright builds the demo and starts its own server on port 4173. Keep that port free. Use `npm run dev` to explore the player, or `npm run test:ui` to inspect tests interactively.

## Test plan

| Scenario | Evidence | Main risk covered |
| --- | --- | --- |
| Tap to play / pause | Current time advances; native paused state changes | A responsive button hiding broken playback |
| Seek and mute | Media time, displayed time and native muted state | Controls disconnected from the video |
| English captions | VTT loads, expected cue is active, track toggles | Missing or mistimed captions |
| End and replay | Real ended event, replay starts near zero | A player that gets stuck at completion |
| Resume after reload | Position survives; playback stays paused | Lost progress or unwanted autoplay |
| Media failure / retry | Failed request produces an error; retry actually plays | Dead-end error states |
| Portrait / landscape | No horizontal overflow; 44px control targets | Mobile layout regressions |

## Design choices

- **Small, composed helpers.** One player component helper contains shared locators and navigation/seek actions. Tests retain their assertions; there is no base-page hierarchy.
- **Isolated tests.** Each case gets a fresh browser context and its own storage. Resume is verified across a reload within one test, not by depending on another test.
- **Real media.** A generated 12-second clip, audio tone and VTT file ship with the project. MP4 is used where supported, with WebM as a fallback. Only the deliberate failure test intercepts media requests.
- **Condition-based waits.** Assertions retry against observable media state. There are no fixed sleeps, synthetic playback events or JS assignments to `currentTime` in tests.
- **Useful failures.** HTML reports include retained traces, screenshots, recordings and browser diagnostics. CI allows one retry; a retry is not proof that a flaky test is fixed.
- **Production bundle.** Tests run against the built app rather than a hot-reloading development server. Dependencies are pinned in the lockfile.

## Layout

```text
demo/                         Small mobile player and local media
tests/playback.spec.ts         Playback, seeking, captions and replay
tests/resilience.spec.ts       Resume, recovery and responsive controls
tests/fixtures/player.fixture.ts
tests/support/player.ts       Repeated player actions and locators
playwright.config.ts          Browser matrix, server and diagnostics
.github/workflows/playwright.yml
docs/verification.md           Actual local run results and limits
```

## Scope and limits

This is **mobile browser emulation**, not a real Android/iPhone device or React Native app test. Seeking is exercised through the slider's keyboard interface; tapping the other controls uses touch input. It does not verify a physical slider drag, native fullscreen, audible output, caption rendering pixels, device rotation sensors or hardware decoding.

It also does not cover HLS/DASH, DRM, live streaming, network adaptation, authentication, uploads or offline synchronization. The failure case is an initial media request failure, not an offline playback/cache guarantee. Those features should receive separately agreed scenarios on a real application. Service workers are blocked here to keep failure injection observable and reproducible.

To adapt this to a client project, inspect its existing suite and fixtures first, map the player helper to its accessible controls, replace sample expectations with agreed requirements, and retain real media assertions. If a test finds an application defect, report it rather than weakening the assertion.

## Fixture provenance

`motion.mp4` and `motion.webm` were generated locally with FFmpeg's `testsrc2` pattern and a quiet sine wave. No third-party footage, personal data, credentials or external assets are included. Example regeneration with FFmpeg installed:

```sh
ffmpeg -y -f lavfi -i 'testsrc2=size=640x360:rate=24:duration=12' \
  -f lavfi -i 'sine=frequency=440:sample_rate=44100:duration=12' \
  -vf 'hue=s=0.45' -af volume=0.03 -c:v libx264 -preset fast -crf 30 \
  -pix_fmt yuv420p -c:a aac -b:a 48k -movflags +faststart -shortest \
  demo/public/media/motion.mp4
ffmpeg -y -i demo/public/media/motion.mp4 -c:v libvpx -b:v 220k \
  -c:a libvorbis -b:a 48k demo/public/media/motion.webm
```

Playwright references: [fixtures](https://playwright.dev/docs/test-fixtures), [mobile emulation](https://playwright.dev/docs/emulation), [assertions](https://playwright.dev/docs/test-assertions), [trace viewer](https://playwright.dev/docs/trace-viewer).
