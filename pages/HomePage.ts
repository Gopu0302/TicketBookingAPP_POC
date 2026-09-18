import { type Locator, type Page, expect } from '@playwright/test';

/** Page object for the redBus homepage bus search widget. */
export class HomePage {
  readonly page: Page;
  readonly fromInput: Locator;
  readonly toInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fromInput = page.locator('#srcinput');
    this.toInput = page.locator('#destinput');
    this.searchButton = page.getByRole('button', { name: 'Search buses' });
  }

  async goto() {
    // redBus keeps issuing background requests after 'load', so wait for DOM only.
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async assertLoaded() {
    await expect(this.page).toHaveTitle(/redBus/i);
    await expect(this.fromInput).toBeVisible();
    await expect(this.toInput).toBeVisible();
  }

  /** Types a city name and picks its city-level suggestion. Suggestion rows mix city names into both headings and subtitles (e.g. boarding points show "Hyderabad" as a subtitle under "Kukatpally"), so matching plain text can select the wrong row - only the heading is guaranteed to be the row's own city. Returns the label actually selected. */
  private async selectCity(input: Locator, cityName: string): Promise<string> {
    // The sticky page header overlaps the input's hit-test box, so a plain click gets intercepted.
    await input.click({ force: true });
    await input.pressSequentially(cityName, { delay: 80 });
    const suggestion = this.page.getByRole('heading', { name: cityName, exact: true }).first();
    await suggestion.waitFor({ state: 'visible' });
    const label = (await suggestion.textContent())?.trim() ?? cityName;
    await suggestion.click();
    return label;
  }

  /** Searches buses and returns the city labels redBus actually resolved (may differ from the typed input, e.g. an area instead of the city). */
  async searchBuses(fromCity: string, toCity: string): Promise<{ from: string; to: string }> {
    const from = await this.selectCity(this.fromInput, fromCity);
    const to = await this.selectCity(this.toInput, toCity);
    await this.searchButton.click();
    return { from, to };
  }
}

