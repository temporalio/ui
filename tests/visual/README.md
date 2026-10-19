# Tailwind visual regression tests

The light/dark desktop/mobile workflow baselines were captured from
`bd5c66003e352a93f72da4205b2cd29e5f9db5b9` with Tailwind CSS 3.4.19 before
the Tailwind 4 migration. The touch baseline was added after the migration to
protect controls affected by Tailwind 4's hover-media behavior. The focused
mobile table baselines were also added after migration because the table sits
below the internally scrolling mobile viewport.

Run the platform-specific snapshots locally with:

```sh
pnpm test:visual
```

Chromatic remains the cross-platform CI visual regression gate for the
component stories.
