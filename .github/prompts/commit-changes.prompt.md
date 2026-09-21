---
description: "Stage and commit the current working tree changes to the local branch with a clear, conventional commit message."
agent: "agent"
tools: [execute, read, search]
argument-hint: "Optional commit message, or leave blank to generate one from the diff"
---
Commit the current changes to the local branch:

1. Run `git status` and `git diff` (staged and unstaged) to see what changed.
2. Stage the relevant changes with `git add`. Do not stage unrelated or ignored files.
3. Write a concise, conventional commit message (e.g. `feat: ...`, `fix: ...`, `chore: ...`) summarizing the change, using the user-provided message if given via ${input}.
4. Commit with `git commit -m "<message>"`.
5. Do not push, amend published commits, or rewrite history.

Report the commit hash and message created.
