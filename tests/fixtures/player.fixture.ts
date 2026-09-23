import { test as base, expect } from '@playwright/test';
import { createPlayer } from '../support/player';

type Fixtures = { player: ReturnType<typeof createPlayer>; diagnostics: void };

export const test = base.extend<Fixtures>({
  player: async ({ page }, use) => { await use(createPlayer(page)); },
  diagnostics: [async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
    await use();
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('browser-diagnostics', {
        body: JSON.stringify(errors, null, 2), contentType: 'application/json',
      });
    }
  }, { auto: true }],
});

export { expect };
