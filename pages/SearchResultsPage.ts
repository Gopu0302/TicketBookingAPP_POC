import { type Locator, type Page, expect } from '@playwright/test';

/** Page object for the redBus bus search results (/search) page. */
export class SearchResultsPage {
  readonly page: Page;
  readonly busCount: Locator;

  constructor(page: Page) {
    this.page = page;
    // Promo banners also contain the word " to ", so match on the aria-label redBus sets for the route heading instead of free text.
    this.busCount = page.getByText(/\d+ buses? found/i).first();
  }

  async assertResultsLoaded(fromCity: string, toCity: string) {
    await expect(this.page).toHaveURL(/\/search\?/);
    await expect(this.page.locator(`[aria-label="${fromCity} to ${toCity}"]`)).toBeVisible();
    await expect(this.busCount).toBeVisible();
  }
}
