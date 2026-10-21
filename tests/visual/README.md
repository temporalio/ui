# Tailwind visual regression tests

The light/dark desktop/mobile workflow baselines were captured from
`bd5c66003e352a93f72da4205b2cd29e5f9db5b9` with Tailwind CSS 3.4.19 before
the Tailwind 4 migration. The touch baseline was added after the migration to
protect controls affected by Tailwind 4's hover-media behavior. The focused
mobile table baselines were also added after migration because the table sits
below the internally scrolling mobile viewport.

## Coverage

The suite contains 14 tests and 16 LFS-backed snapshots:

- Workflow history in light and dark mode at desktop and mobile widths.
- Focused mobile event-history tables in light and dark mode.
- Touch-device navigation and copy controls.
- Schedule creation at desktop and mobile widths.
- Open schedule controls and dark-mode validation errors.
- Dark-mode schedule loading skeletons.
- Workflow timelines at desktop and mobile widths.
- Workflow reset modal and expanded mobile workflow form.

## Verification

Run the platform-specific snapshots locally:

```sh
pnpm test:visual
```

The migration proof run completed twice consecutively with all 14 tests passing.

Chromatic remains the cross-platform CI visual regression gate for the
component stories.
