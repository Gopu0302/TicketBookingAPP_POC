import { type Locator, type Page, expect } from '@playwright/test';
import type { BusRouteQuery } from '../test-data/routes';

/** Page object for the redBus bus search results (/search) page. */
export class SearchResultsPage {
  readonly page: Page;
  readonly busCount: Locator;
  readonly busCards: Locator;
  readonly clearAllFiltersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // The count reads e.g. "285 buses" / "0 buses" - no "found" suffix, despite that being the natural wording to assume.
    this.busCount = page.getByText(/^\d+ buses?$/i).first();
    // Each result's own aria-label bundles operator, times, duration and fare, so it alone is enough to assert on all of them without depending on hashed CSS classes.
    this.busCards = page.locator('li[role="button"][aria-label*="Duration"]');
    // Lives in the filter sidebar's own header, not behind a modal.
    this.clearAllFiltersButton = page.getByRole('button', { name: 'Clear all' });
  }

  async assertResultsLoaded(fromCity: string, toCity: string) {
    await expect(this.page).toHaveURL(/\/search\?/);
    await expect(this.page.locator(`[aria-label="${fromCity} to ${toCity}"]`)).toBeVisible();
    await expect(this.busCount).toBeVisible();
  }

  /** Navigates straight to a route/date's results, bypassing the date-picker widget (reaching a date far out via the calendar UI is slow and flaky). */
  async gotoForDate(query: BusRouteQuery, dateOfJourney: string) {
    const params = new URLSearchParams({
      fromCityName: query.from,
      fromCityId: String(query.fromCityId),
      srcCountry: 'India',
      fromCityType: query.fromCityType,
      toCityName: query.to,
      toCityId: String(query.toCityId),
      destCountry: 'IND',
      toCityType: query.toCityType,
      onward: dateOfJourney,
      doj: dateOfJourney,
      ref: 'home',
    });
    await this.page.goto(`/search?${params.toString()}`, { waitUntil: 'domcontentloaded' });
  }

  async assertNoBusesFound() {
    await expect(this.busCount).toHaveText(/^0 buses$/i);
    await expect(this.busCards).toHaveCount(0);
  }

  /** Asserts the first result's aria-label exposes operator, departure/arrival times, duration and fare (redBus encodes all of these into one accessible label per card). */
  async assertFirstBusShowsKeyDetails() {
    const firstCard = this.busCards.first();
    await expect(firstCard).toBeVisible();
    const label = (await firstCard.getAttribute('aria-label')) ?? '';
    expect(label.split(',')[0].trim().length, 'operator name should be present').toBeGreaterThan(0);
    expect(label).toMatch(/Departs \d{1,2}:\d{2}/);
    expect(label).toMatch(/arrives \d{1,2}:\d{2}/);
    expect(label).toMatch(/Duration/i);
    expect(label).toMatch(/Price \d+ INR/i);
  }

  /** Parses the bus count banner (e.g. "255 buses") into a number, waiting out the async refresh that follows a sort/filter change. */
  async getBusCount(): Promise<number> {
    await expect(this.busCount).toHaveText(/^\d+ buses?$/i);
    const text = await this.busCount.textContent();
    return Number(text?.match(/\d+/)?.[0]);
  }

  /** Reads each visible result's fare (INR), in list order, from its aria-label. */
  async getFares(): Promise<number[]> {
    const labels = await this.busCards.evaluateAll((cards) => cards.map((card) => card.getAttribute('aria-label') ?? ''));
    return labels.map((label) => Number(label.match(/Price (\d+) INR/)?.[1]));
  }

  /** Reads each visible result's departure hour (0-23), in list order, from its aria-label - used to verify departure-time filters. */
  async getDepartureHours(): Promise<number[]> {
    const labels = await this.busCards.evaluateAll((cards) => cards.map((card) => card.getAttribute('aria-label') ?? ''));
    return labels.map((label) => Number(label.match(/Departs (\d{1,2}):/)?.[1]));
  }

  /** Quick-filter chips (bus type/departure window) sit in the results toolbar as checkboxes labelled "<name> (<count>)"; the count shifts as other filters apply, so match on the name prefix only. */
  private quickFilterChip(name: string): Locator {
    return this.page.getByRole('checkbox', { name: new RegExp(`^${name} \\(\\d+\\)$`) });
  }

  /** Toggles a bus-type or departure-window quick filter, e.g. "AC", "NONAC", "SLEEPER", "SEATER", "06:00-12:00". */
  async toggleQuickFilter(name: string) {
    await this.quickFilterChip(name).click();
    // Filtering triggers an async refresh; wait for the count to settle before the caller reads results.
    await expect(this.busCount).toHaveText(/^\d+ buses?$/i);
  }

  async quickFilterIsApplied(name: string): Promise<boolean> {
    return this.quickFilterChip(name).isChecked();
  }

  /** Reads the result count shown on a quick filter's own chip (e.g. 255 for "AC (255)"), before it's applied. */
  async getQuickFilterCount(name: string): Promise<number> {
    const label = await this.quickFilterChip(name).textContent();
    return Number(label?.match(/\((\d+)\)/)?.[1]);
  }

  /** Picks a sort order from the results header's "Sort by" radio group (each option already implies one fixed direction, e.g. "Price" sorts cheapest first). */
  async sortBy(criterion: 'Ratings' | 'Departure time' | 'Price') {
    await this.page.getByRole('radiogroup', { name: 'Sort by' }).getByRole('radio', { name: criterion }).click();
    await expect(this.busCount).toHaveText(/^\d+ buses?$/i);
  }

  /** Removes every applied filter at once via the filter sidebar's "Clear all" button. */
  async clearAllFilters() {
    await this.clearAllFiltersButton.click();
    await expect(this.busCount).toHaveText(/^\d+ buses?$/i);
  }
}
