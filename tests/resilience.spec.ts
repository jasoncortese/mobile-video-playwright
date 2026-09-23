import { test, expect } from './fixtures/player.fixture';

test('a reload restores progress without autoplaying', async ({ page, player }) => {
  await player.open();
  await player.seekTo(4);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled();
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(4, 0);
  await expect(player.media).toHaveJSProperty('paused', true);
});

test('a failed media request shows a useful error and retry recovers', async ({ page, player }) => {
  const mediaRequests = '**/media/motion.*';
  await page.route(mediaRequests, route => route.abort('failed'));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Video unavailable');
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeDisabled();

  await page.unroute(mediaRequests);
  await page.getByRole('button', { name: 'Retry video', exact: true }).tap();
  await expect(page.getByRole('alert')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Play', exact: true }).tap();
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.2);
});

test('portrait and landscape keep the player and controls usable', async ({ page, player }) => {
  await player.open();
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(player.media).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const name of ['Play', 'Mute audio', 'Show captions']) {
      const button = page.getByRole('button', { name, exact: true });
      const box = await button.boundingBox();
      expect(box, `${name} should have a layout box`).not.toBeNull();
      expect(box!.width, `${name} touch target width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${name} touch target height`).toBeGreaterThanOrEqual(44);
    }
  }
});
