import { test, expect } from './fixtures/player.fixture';

test('a tap starts real playback and pause stops it', async ({ page, player }) => {
  await player.open();
  await expect(player.media).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Play', exact: true }).tap();
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.2);
  await expect(player.media).toHaveJSProperty('paused', false);
  await page.getByRole('button', { name: 'Pause', exact: true }).tap();
  await expect(player.media).toHaveJSProperty('paused', true);
  await expect(page.getByRole('status', { name: 'Playback status' })).toHaveText('Paused');
});

test('seeking and audio controls update the media element', async ({ page, player }) => {
  await player.open();
  await player.seekTo(4);
  await expect(page.getByLabel('Playback time')).toHaveText('0:04 / 0:12');
  await page.getByRole('button', { name: 'Mute audio', exact: true }).tap();
  await expect(player.media).toHaveJSProperty('muted', true);
  await page.getByRole('button', { name: 'Unmute audio', exact: true }).tap();
  await expect(player.media).toHaveJSProperty('muted', false);
});

test('English captions load and can be toggled', async ({ page, player }) => {
  await player.open();
  await page.getByRole('button', { name: 'Show captions', exact: true }).tap();
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) => v.textTracks[0].mode)).toBe('showing');
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) => v.textTracks[0].cues?.length)).toBe(3);
  await player.seekTo(5);
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) =>
    (v.textTracks[0].activeCues?.[0] as VTTCue | undefined)?.text,
  )).toBe('Playback, seeking and captions should stay in sync.');
  await page.getByRole('button', { name: 'Hide captions', exact: true }).tap();
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) => v.textTracks[0].mode)).toBe('disabled');
});

test('a completed video offers replay from the beginning', async ({ page, player }) => {
  await player.open();
  await player.seekTo(11);
  await page.getByRole('button', { name: 'Play', exact: true }).tap();
  await expect(player.media).toHaveJSProperty('ended', true);
  await page.getByRole('button', { name: 'Replay', exact: true }).tap();
  await expect(player.media).toHaveJSProperty('paused', false);
  await expect.poll(() => player.media.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(3);
});
