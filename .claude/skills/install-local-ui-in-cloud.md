# Install Local UI Package in Cloud UI

**Trigger phrases:** "install local ui in cloud", "build ui for cloud", "test ui changes in cloud", "local ui package"

## Purpose

This skill replicates the GitHub Actions "Generate temporalio/ui PR" workflow locally when GitHub Actions is unavailable or for faster iteration. It builds the UI package from the current branch and installs it in a local cloud-ui repository.

## Prerequisites Check

Before proceeding, verify the user has cloud-ui available:

1. Ask: "Do you have the cloud-ui repository cloned locally?"
2. If YES: Ask for the path, then instruct: "Please run `/add-dir <path-to-cloud-ui>` so I can access both repositories"
3. If NO: Explain they need to clone it first, then add it with `/add-dir`

**CRITICAL:** Do not proceed until cloud-ui is added to the context with `/add-dir`.

## Workflow Steps

### Step 1: Build the UI Package

In the **ui** repository (current repo):

```bash
# Ensure dependencies are installed
pnpm install

# Sync SvelteKit (required before packaging)
pnpm svelte-kit sync

# Build the library package (NOT pnpm build!)
pnpm package

# Create the tarball
pnpm pack
```

**CRITICAL:** You must run `pnpm package` (not `pnpm build`).

- `pnpm package` = builds the library for distribution (creates optimized dist/)
- `pnpm build` = builds the dev/docs server (wrong for this use case)

**Expected output:** A `.tgz` file in the ui root directory (e.g., `temporalio-ui-2.45.2.tgz`, ~1.0MB)

### Step 2: Install in Cloud UI

In the **cloud-ui** repository (must be added with `/add-dir`):

```bash
# Navigate to cloud-ui directory
cd <path-to-cloud-ui>

# Install the local UI package
pnpm install <path-to-ui-repo>/temporalio-ui-<version>.tgz
```

**What this does:**

- Updates `cloud-ui/package.json` dependencies to point `@temporalio/ui` to the local tarball
- Installs the built UI package from your branch
- Allows testing UI changes in the cloud environment

### Step 2.5: Update pnpm.overrides (CRITICAL!)

**IMPORTANT:** cloud-ui uses `pnpm.overrides` which takes precedence over dependencies. You MUST update this:

1. **Find the overrides section** in `cloud-ui/package.json` (typically near the end):

   ```json
   "overrides": {
     "@temporalio/ui": "file:./packs/temporalio-ui-XXXXXXXX.tgz",
     "devalue": "5.6.2"
   }
   ```

2. **Update the override** to point to your local tarball:

   ```json
   "overrides": {
     "@temporalio/ui": "file:<absolute-path-to-ui-repo>/temporalio-ui-<version>.tgz",
     "devalue": "5.6.2"
   }
   ```

3. **Run pnpm install** again to apply the override:
   ```bash
   pnpm install
   ```

**Why this matters:** Without updating the override, pnpm will ignore your dependency change and continue using the old pack referenced in overrides.

### Step 3: Start Cloud UI Dev Server

```bash
# In cloud-ui directory
pnpm dev

# Or for production build
pnpm build
```

Now you can test the UI changes in the cloud environment at `http://localhost:5173` (or configured port).

## Verification

After installation, verify:

1. Check `cloud-ui/package.json` dependencies show the local path:

   ```json
   "@temporalio/ui": "file:/absolute/path/to/ui/temporalio-ui-2.45.2.tgz"
   ```

2. Check `cloud-ui/package.json` overrides also point to the local path:

   ```json
   "overrides": {
     "@temporalio/ui": "file:/absolute/path/to/ui/temporalio-ui-2.45.2.tgz"
   }
   ```

3. Check `cloud-ui/node_modules/@temporalio/ui/package.json` version matches

4. Start dev server and verify UI changes appear

## Cleanup

To revert to the published package:

```bash
# In cloud-ui directory
pnpm install @temporalio/ui@latest
```

## Troubleshooting

**"Cannot find module":**

- Ensure you ran `pnpm pack` in the ui repo first
- Verify the tarball path is correct

**"Changes not appearing":**

- Clear cloud-ui's dev server cache and restart
- Check that `pnpm pack` built the latest changes
- Verify `node_modules/@temporalio/ui` contains your changes

**"Workspace dependency issues":**

- Ensure both repos use compatible pnpm/node versions
- Try `pnpm install --force` in cloud-ui

## Example Full Workflow

```bash
# In ui repo - build the package
cd ~/code/ui
git checkout my-feature-branch
pnpm install
pnpm svelte-kit sync
pnpm package  # Build the library (NOT pnpm build!)
pnpm pack     # Creates temporalio-ui-2.45.2.tgz (~1.0MB)

# In cloud-ui repo - install local package
cd ~/code/cloud-ui
pnpm install ~/code/ui/temporalio-ui-2.45.2.tgz

# CRITICAL: Update the pnpm.overrides in package.json
# Edit package.json and change the overrides section:
# "@temporalio/ui": "file:/Users/ross/code/ui/temporalio-ui-2.45.2.tgz"

# Apply the override
pnpm install

# Start dev server
pnpm dev
# Visit http://localhost:3000 to test (cloud-ui uses port 3000, not 5173)
```

## When to Use This Skill

- GitHub Actions is degraded/unavailable
- Faster iteration than waiting for CI
- Testing UI changes in cloud environment locally
- Debugging integration issues between ui and cloud-ui

## What This Replaces

This replicates the `Generate temporalio/ui PR` GitHub Actions workflow which:

1. Checks out the UI branch
2. Builds the package
3. Creates a cloud-ui PR with the updated package reference

The local version gives immediate feedback without waiting for CI.

## ⚠️ CRITICAL: Do NOT Commit cloud-ui Changes

**IMPORTANT:** The changes made to `cloud-ui/package.json` and `cloud-ui/pnpm-lock.yaml` are for **local testing only**.

**DO NOT:**

- ❌ Commit changes in cloud-ui
- ❌ Push changes in cloud-ui
- ❌ Create PRs with these changes

**Only commit and push changes in the UI repo!**

The GitHub Actions workflow will create the proper cloud-ui PR automatically when it's available.
