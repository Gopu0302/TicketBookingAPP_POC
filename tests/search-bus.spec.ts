import { test } from '../fixtures/pages';
import { routes } from '../test-data/routes';

test.describe('Bus search', () => {
  test('searching a route navigates to results with buses listed', async ({ homePage, searchResultsPage }) => {
    const { from, to } = routes.hyderabadToBengaluru;

    await homePage.goto();
    // redBus may resolve the typed city to a nearby area/suggestion, so assert against what was actually selected.
    const selected = await homePage.searchBuses(from, to);
    await searchResultsPage.assertResultsLoaded(selected.from, selected.to);
  });
});
