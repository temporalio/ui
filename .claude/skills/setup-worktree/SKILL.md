---
name: setup-worktree
description: Set up a new git worktree for this repo by copying gitignored files (bin/) and building server assets so pnpm dev works without errors
---

## Purpose

When a new git worktree is created, gitignored files (like the Temporal CLI binary in `bin/`) are missing and server assets haven't been built. Run this skill to get a new worktree ready for development.

## Steps

### 1. Find the main worktree path

```bash
git worktree list
```

The first entry is the main worktree. Use it as `$MAIN`.

### 2. Copy .env from the main worktree

```bash
MAIN=$(git worktree list | head -1 | awk '{print $1}')
cp $MAIN/.env ./.env
```

### 3. Build server assets

Builds the frontend into `server/ui/assets/` which the Go server embeds. Required for `pnpm dev` to start.

```bash
pnpm build:server
```

`pnpm dev` should now start without errors.

## Why each step is needed

| Step                | Why                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy `.env`         | Gitignored — not present in a fresh worktree, needed for dev modes                                                                            |
| `pnpm build:server` | Runs `VITE_API= BUILD_PATH=server/ui/assets/local vite build` — without this, `pnpm dev` fails because the embedded server assets are missing |
