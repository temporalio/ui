---
name: setup-worktree
description: Set up a new git worktree for this repo by copying gitignored files (bin/) and building server assets so pnpm dev works without errors
---

## Purpose

When a new git worktree is created, gitignored files (like the Temporal CLI binary in `bin/`) are missing and server assets haven't been built. Run this skill to get a new worktree ready for development.

## Steps

### 1. Find the main worktree

```bash
git worktree list
```

The first entry is the main worktree path. Use it as the source for copying gitignored files.

### 2. Copy gitignored files

```bash
MAIN=$(git worktree list | head -1 | awk '{print $1}')

# Copy the Temporal CLI binary
cp -r $MAIN/bin ./bin

# Copy any .env files if present
for f in $MAIN/.env $MAIN/.env.*; do
  [ -f "$f" ] && cp "$f" . && echo "Copied $(basename $f)"
done
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Build server assets

Builds the frontend into `server/ui/assets/` which the Go server embeds. Required for `pnpm dev` to start.

```bash
pnpm build:server
```

### 5. Verify

```bash
ls bin/cli/temporal      # Temporal CLI binary exists
ls server/ui/assets/     # Server assets were built
```

`pnpm dev` should now start without errors.

## Why each step is needed

| Step                | Why                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy `bin/`         | Contains the Temporal CLI — gitignored, not re-downloaded without a full `pnpm install` prepare script run                                    |
| Copy `.env*`        | Local environment config — gitignored, needed for dev modes                                                                                   |
| `pnpm install`      | Installs `node_modules` in the new worktree                                                                                                   |
| `pnpm build:server` | Runs `VITE_API= BUILD_PATH=server/ui/assets/local vite build` — without this, `pnpm dev` fails because the embedded server assets are missing |
