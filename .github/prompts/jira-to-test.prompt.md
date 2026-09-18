---
agent: agent
description: Read a Jira user story and generate Playwright automation test scripts following this repo's conventions
---
You are generating Playwright automation tests for redbus.in from a Jira user story.

## Input
Ask for a Jira issue key if one wasn't provided (e.g. `PROJ-123`).

## Steps

1. **Fetch the story** via the `atlassian` MCP server: get the issue's summary, description, and
   acceptance criteria. Follow any linked Confluence pages for extra detail.
2. **Derive test cases**: turn each acceptance criterion into one concrete test case (happy path +
   the meaningful edge/negative cases). List the test cases briefly before writing code.
3. **Implement following these repo guidelines**:
   - One spec file per feature/story: `tests/<feature>.spec.ts`, using a `test.describe()` block
     named after the story.
   - Never put raw selectors or `page.goto(...)` calls directly in spec files — add/extend methods
     on Page Object Model classes in `pages/` (e.g. `HomePage`, `SearchResultsPage`). Specs only call
     page-object methods and assert on their return values.
   - Import `test`/`expect` from `../fixtures/pages` (not `@playwright/test` directly) so page
     objects are injected as fixtures. Add new page objects to `fixtures/pages.ts` if you create one.
   - Reuse/extend data in `test-data/` (e.g. `routes.ts`) instead of hardcoding cities, dates, or
     fares inline in specs.
   - Rely on `baseURL` from `playwright.config.ts` — use relative paths (`/`, `/search`) in
     `page.goto()`, never hardcode `https://www.redbus.in`.
   - Match the existing comment style: one short line explaining *why*, only where the code isn't
     self-explanatory (see `HomePage.ts` for examples). Don't add docstrings or restate the code.
4. **Run `npx playwright test`** and fix failures before finishing. If a locator is flaky or
   redBus's bot-protection blocks it, prefer the `chromium` project (`channel: chrome`), already
   configured as the default in `playwright.config.ts`.
5. **Summarize**: list the test cases implemented and the Playwright test run result.

## Optional follow-up (only if explicitly asked)
Create a branch `<ISSUE-KEY>-<short-slug>` off `main`, commit referencing the issue key, push, and
open a PR via the `github` MCP server against `anilltm/redbus` summarizing the test cases added.
