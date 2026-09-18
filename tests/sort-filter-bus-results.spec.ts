import { test, expect } from '../fixtures/pages';
import { routeQueries } from '../test-data/routes';

test.describe('KAN-2: Sort/filter bus search results', () => {
  test.beforeEach(async ({ searchResultsPage }) => {
    await searchResultsPage.gotoForDate(routeQueries.hyderabadToBengaluru, '19-Sep-2026');
  });

  test('sorting by "Price: Low to High" reorders results with the cheapest bus first', async ({ searchResultsPage }) => {
    await searchResultsPage.sortBy('Price');

    const fares = await searchResultsPage.getFares();
    expect(fares.length).toBeGreaterThan(1);
    expect(fares).toEqual([...fares].sort((a, b) => a - b));
  });

  test('filtering by the morning departure window shows only buses departing 6AM-12PM', async ({ searchResultsPage }) => {
    await searchResultsPage.toggleQuickFilter('06:00-12:00');

    const hours = await searchResultsPage.getDepartureHours();
    expect(hours.length).toBeGreaterThan(0);
    expect(hours.every((hour) => hour >= 6 && hour < 12)).toBe(true);
  });

  test('filtering by AC bus type shows only the buses redBus counts as AC', async ({ searchResultsPage }) => {
    // The chip's own count is redBus's ground truth for how many results should remain, so assert against it rather than a hardcoded number.
    const expectedCount = await searchResultsPage.getQuickFilterCount('AC');
    await searchResultsPage.toggleQuickFilter('AC');

    expect(await searchResultsPage.getBusCount()).toBe(expectedCount);
  });

  test('an applied filter is highlighted on its chip and can be cleared individually', async ({ searchResultsPage }) => {
    const originalCount = await searchResultsPage.getBusCount();

    await searchResultsPage.toggleQuickFilter('SLEEPER');
    expect(await searchResultsPage.quickFilterIsApplied('SLEEPER')).toBe(true);
    expect(await searchResultsPage.getBusCount()).toBeLessThan(originalCount);

    await searchResultsPage.toggleQuickFilter('SLEEPER');
    expect(await searchResultsPage.quickFilterIsApplied('SLEEPER')).toBe(false);
    expect(await searchResultsPage.getBusCount()).toBe(originalCount);
  });

  test('"Clear all" removes every applied filter at once', async ({ searchResultsPage }) => {
    const originalCount = await searchResultsPage.getBusCount();

    await searchResultsPage.toggleQuickFilter('AC');
    await searchResultsPage.toggleQuickFilter('SLEEPER');
    expect(await searchResultsPage.getBusCount()).toBeLessThan(originalCount);

    await searchResultsPage.clearAllFilters();
    expect(await searchResultsPage.quickFilterIsApplied('AC')).toBe(false);
    expect(await searchResultsPage.quickFilterIsApplied('SLEEPER')).toBe(false);
    expect(await searchResultsPage.getBusCount()).toBe(originalCount);
  });
});
