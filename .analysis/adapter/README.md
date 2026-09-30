# Adapter package build

Canonical script: repo-root [`build.mjs`](../../build.mjs).

```sh
cd ../..   # repository root
git submodule update --init --recursive
cd upstream && pnpm install --frozen-lockfile --ignore-scripts && pnpm exec svelte-kit sync && cd ..
node build.mjs
```

Adapter sources currently live in `.analysis/adapter/src/` until they move to root `src/`. Output: `package/` (+ `npm pack` → `.tgz`).
