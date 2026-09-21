import { test, expect } from '../fixtures/pages';
import { routes, routeQueries } from '../test-data/routes';

test.describe('KAN-4: Search Bus Tickets', () => {
  // The autocomplete occasionally stalls on first attempt; selectCity's internal retries need more than the default 30s budget.
  test.describe.configure({ timeout: 90_000 });

  test('searching a route navigates to results with buses listed', async ({ homePage, searchResultsPage }) => {
    const { from, to } = routes.hyderabadToBengaluru;

    await homePage.goto();
    // redBus may resolve the typed city to a nearby area/suggestion, so assert against what was actually selected.
    const selected = await homePage.searchBuses(from, to);
    await searchResultsPage.assertResultsLoaded(selected.from, selected.to);
  });

  test('each result shows operator, times, duration and fare', async ({ searchResultsPage }) => {
    await searchResultsPage.gotoForDate(routeQueries.hyderabadToBengaluru, '19-Sep-2026');
    await searchResultsPage.assertFirstBusShowsKeyDetails();
  });

  test('a route/date with no buses shows a zero-results state, not an error', async ({ searchResultsPage }) => {
    // A date far beyond redBus's booking window reliably has no published schedules yet.
    await searchResultsPage.gotoForDate(routeQueries.hyderabadToBengaluru, '15-Sep-2027');
    await searchResultsPage.assertNoBusesFound();
  });

  test('the same city cannot be picked for both From and To', async ({ homePage }) => {
    const sameCity = 'Hyderabad';
    const includesSameCity = await homePage.destinationSuggestionsIncludeExact(sameCity, sameCity);
    expect(includesSameCity).toBe(false);
  });

  test('sorting by "Price: Low to High" reorders results with the cheapest bus first', async ({ searchResultsPage }) => {
    await searchResultsPage.gotoForDate(routeQueries.hyderabadToBengaluru, '19-Sep-2026');
    await searchResultsPage.sortBy('Price');

    const fares = await searchResultsPage.getFares();
    expect(fares.length).toBeGreaterThan(1);
    expect(fares).toEqual([...fares].sort((a, b) => a - b));
  });

  test('filtering by AC bus type shows only matching buses and can be cleared', async ({ searchResultsPage }) => {
    await searchResultsPage.gotoForDate(routeQueries.hyderabadToBengaluru, '19-Sep-2026');
    const originalCount = await searchResultsPage.getBusCount();
    const expectedCount = await searchResultsPage.getQuickFilterCount('AC');

    await searchResultsPage.toggleQuickFilter('AC');
    expect(await searchResultsPage.quickFilterIsApplied('AC')).toBe(true);
    expect(await searchResultsPage.getBusCount()).toBe(expectedCount);

    await searchResultsPage.clearAllFilters();
    expect(await searchResultsPage.quickFilterIsApplied('AC')).toBe(false);
    expect(await searchResultsPage.getBusCount()).toBe(originalCount);
  });
});
