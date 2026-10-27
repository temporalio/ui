---
component: Toast
source: ./toaster.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Toast contract

Also covers `./toaster.ts`, `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `ToasterProps`, `IoToasterOptions` and Ark's toast options, so not repeated: the `toaster`, `label`, `closeLabel` and `class` props and their defaults; the five `ToastStatusType` values; the `createIoToaster` defaults (`placement: 'bottom-end'`, `max: 5`, `gap: 12`, `duration: 5000`, `pauseOnPageIdle: true`); that `title` and `description` accept a string or a snippet.

## Input

- **IN-1** An app SHOULD render one `Toaster` for the shared `toaster`, near the root. A part of the app that needs its own placement or limits MAY use `createIoToaster` with its own `Toaster`.
- **IN-2** Each mounted toaster MUST use a distinct `placement`. The toast group's id is `toast-group:<placement>`, so two toasters with the same placement render duplicate ids, and the second toaster's toasts do not render. The docs page avoids this by giving the anatomy toaster `bottom-start` (`docs/src/routes/components/toast/+page.svelte`).
- **IN-3** Every toast MUST have a `title` that states the outcome in a few words. `description` SHOULD only add detail that helps people decide what to do next. Text SHOULD be translated; the component renders it verbatim.
- **IN-4** `type` MUST match the outcome: `success` for a completed action, `error` for a failure, `warning` for a risk the person should know about, `info` for neutral news and `loading` for work in progress. `type` sets the icon and accent color.
- **IN-5** A toast MUST NOT be the only way to complete a task or the only place an error is reported. A failure that blocks the current task SHOULD be shown inline or in a Dialog; a toast MAY repeat it.
- **IN-6** A toast MAY have one `action`. Its label MUST name the follow-up, such as "View", and it MUST NOT be destructive.
- **IN-7** `class` is merged through `twMerge` in `toastRecipe` after the accent classes, onto every toast the `Toaster` renders. It MUST NOT change the border or accent colors; use `type`.

## Behavior

- **BEH-1** A toast with an `action` and no `duration` stays open until the action is used or the toast is closed: the toaster methods pass the data through `persistToastWithAction` (`toaster.ts`), which sets `duration: Infinity`. Passing `duration` keeps a timer. This applies to `create`, `success`, `error`, `warning`, `info`, `loading`, `update`, and the `success` and `error` results of `promise`.
- **BEH-2** Other toasts close after the toaster's `duration` (5000ms by default). Hovering or focusing the toast region pauses the timers, and with `pauseOnPageIdle` they also pause while the page is hidden.
- **BEH-3** `toaster.promise` shows the `loading` toast, then replaces it with the `success` or `error` toast when the promise settles.
- **BEH-4** The close button renders unless the toast sets `closable: false`. The action button closes the toast after its `onClick`.
- **BEH-5** At most `max` toasts are visible; later ones wait in a queue.
- **BEH-6** The toast group is positioned with `position: fixed` and is not portalled. Inside an element with a transform, it is positioned relative to that element.

## Display

- **DIS-1** Each toast is up to 24rem wide (`min(24rem, 100vw - 2rem)`), with a 4px left accent in the type's color and the type's icon. The `loading` icon spins unless reduced motion is preferred.
- **DIS-2** Toasts slide and fade into place. Under `prefers-reduced-motion: reduce` the transitions are removed.

## Accessibility

- **A11Y-1** Toasts are announced from a polite live region named by `label` ("Notifications" by default). `label` SHOULD be translated.
- **A11Y-2** The type icon is decorative (`aria-hidden`). The `title` MUST carry the meaning; color and icon MUST NOT be the only signal of success or failure.
- **A11Y-3** The close button is icon-only and named by `closeLabel`, which SHOULD be translated.
- **A11Y-4** The toast region can be reached with the Alt+T hotkey, which is included in the region's accessible name. Escape dismisses the focused toast.
- **A11Y-5** Toasts with an action persist (BEH-1) so that keyboard and screen reader users have time to reach the action. Callers MUST NOT set a short `duration` on a toast whose action matters.

## Test hooks

- **TEST-1** Neither the toaster nor individual toasts accept a `data-testid`. Tests SHOULD find a toast by its `title` text inside the region named by `label`.

## Known gaps

- **GAP-1** Contradicts A11Y-4. The Accessibility usage text in this file says "Press F8 to move focus to the toasts", but the rendered region's accessible name advertises Alt+T (`aria-label="Notifications, bottom-end (alt+T)"`, Ark's default hotkey).

## Decisions

- **DEC-1** Open. `update` also applies BEH-1: updating a toast with an `action` and no `duration` makes it persistent, even when the original toast had a timer. Decide whether `update` should keep the original duration.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
