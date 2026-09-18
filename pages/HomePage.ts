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
    const suggestion = this.page.getByRole('heading', { name: cityName, exact: true }).first();
    // The autocomplete's XHR occasionally stalls/never resolves; retyping from scratch usually unsticks it, so retry a few times instead of waiting once on a long timeout.
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      // The sticky page header overlaps the input's hit-test box, so a plain click gets intercepted.
      await input.click({ force: true });
      await input.fill('');
      await input.pressSequentially(cityName, { delay: 80 });
      try {
        await suggestion.waitFor({ state: 'visible', timeout: 10000 });
        lastError = undefined;
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (lastError) throw lastError;
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

  /** Selects fromCity, then types toCityQuery into "To" and reports whether it appears as an exact destination suggestion (redBus excludes the already-selected source city rather than showing a text warning). */
  async destinationSuggestionsIncludeExact(fromCity: string, toCityQuery: string): Promise<boolean> {
    await this.selectCity(this.fromInput, fromCity);
    await this.toInput.click({ force: true });
    await this.toInput.pressSequentially(toCityQuery, { delay: 80 });
    const suggestion = this.page.getByRole('heading', { name: toCityQuery, exact: true });
    await this.page.waitForTimeout(1000); // let the suggestion list settle after the last keystroke
    return (await suggestion.count()) > 0;
  }
}

