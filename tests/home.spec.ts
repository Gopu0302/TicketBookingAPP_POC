import { test, expect } from '../fixtures/pages';

test.describe('redBus homepage', () => {
  test('loads with the bus search widget visible', async ({ homePage }) => {
    await homePage.goto();
    await homePage.assertLoaded();
  });
});
