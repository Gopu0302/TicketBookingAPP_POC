---
mode: agent
description: Turn a Jira user story into Playwright tests and open a PR
---
Given a Jira issue key (ask for it if not provided):

1. Fetch the issue via the `atlassian` MCP server (summary, description, acceptance criteria). Pull linked Confluence pages if referenced.
2. Derive a concise list of test cases covering the acceptance criteria (happy path + key edge cases).
3. Create a branch named `<ISSUE-KEY>-<short-slug>` off `main`.
4. Implement/extend Playwright specs under `tests/`, reusing/extending Page Object Model classes in `pages/` and data in `test-data/`. Keep changes scoped to what the story requires.
5. Run `npx playwright test` and fix failures before proceeding.
6. Commit with a message referencing the issue key, push the branch, and open a PR via the `github` MCP server against `anilltm/redbus`, with the issue key in the title and a summary of test cases in the description.
