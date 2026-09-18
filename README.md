# redbus_mcp

Playwright (TypeScript) end-to-end tests for [redbus.in](https://www.redbus.in), with MCP servers
configured so Copilot can read Jira stories and open GitHub PRs directly.

## Setup

```powershell
npm install
npx playwright install
```

## Running tests

```powershell
npm test           # run all tests headless
npm run test:headed
npm run test:ui
npm run report      # open the last HTML report
```

## Project structure

- `tests/` — Playwright spec files
- `pages/` — Page Object Model classes (`HomePage`, `SearchResultsPage`)
- `fixtures/` — custom Playwright fixtures wiring page objects into tests
- `test-data/` — route/search test data
- `playwright.config.ts` — base URL, browser projects, reporter config

## MCP servers

`.vscode/mcp.json` configures two servers used by Copilot in this repo:

- **github** — remote hosted GitHub MCP server, for reading repo content and opening PRs against `anilltm/redbus`.
- **atlassian** — [mcp-atlassian](https://github.com/sooperset/mcp-atlassian) run via `uvx`, for reading Jira stories and Confluence pages on `ltm-team-gyetami4.atlassian.net`.

Start both from the Command Palette: **MCP: List Servers**. On first start you'll be prompted for:

| Input | Where to get it |
| --- | --- |
| GitHub PAT | https://github.com/settings/personal-access-tokens/new — fine-grained token scoped to the `redbus` repo (Contents, Pull requests, Issues: read/write) |
| Atlassian email | Your Atlassian account email |
| Atlassian API token | https://id.atlassian.com/manage-profile/security/api-tokens |

Values are entered via VS Code input prompts and stored securely — never hardcoded in `mcp.json` or committed.

### Prerequisites

- Node.js (LTS) and npm
- [`uv`](https://docs.astral.sh/uv/) installed (provides `uvx`, used to run the Atlassian MCP server). Installed to `%USERPROFILE%\.local\bin`.

## Workflow: Jira story → tests → PR

Use the `/jira-to-test` prompt (`.github/prompts/jira-to-test.prompt.md`) in Copilot Chat with a Jira issue key. It will:

1. Fetch the issue (and linked Confluence pages) via the `atlassian` MCP server.
2. Derive test cases from the acceptance criteria.
3. Create a branch `<ISSUE-KEY>-<slug>`, implement/extend specs and page objects.
4. Run the suite and fix failures.
5. Push the branch and open a PR via the `github` MCP server, referencing the issue key.
