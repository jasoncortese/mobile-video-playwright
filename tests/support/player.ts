import { expect, type Page } from '@playwright/test';

// A small component helper: locators and repeated user actions, no base classes.
export function createPlayer(page: Page) {
  const media = page.getByTestId('video-player');
  const seek = page.getByRole('slider', { name: 'Seek video' });
  return {
    media,
    seek,
    async open() {
      await page.goto('/');
      await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled();
      await expect(media).toHaveJSProperty('readyState', 4);
    },
    async seekTo(seconds: number) {
      // Exercise the real accessible control rather than setting currentTime in JS.
      await seek.focus();
      await seek.press('Home');
      for (let step = 0; step < seconds; step++) await seek.press('ArrowRight');
      await expect.poll(() => media.evaluate((video: HTMLVideoElement) => video.currentTime))
        .toBeCloseTo(seconds, 0);
    },
  };
}
