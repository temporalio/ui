---
component: Pagination
source: ./pagination.svelte
sourceCommit: 40ba43dab
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# Pagination contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `PaginationProps`, so not repeated: that `count` is required and every other prop is optional; the defaults for `page`, `pageSize`, `siblingCount`, `boundaryCount`, `variant`, `type`, `label`, `showSummary` and `pageSizeLabel`; the two `variant` and two `type` values; that other attributes are forwarded to the `nav`.

## Input

- **IN-1** `count` is the total number of items, not pages. `page` is 1-based.
- **IN-2** When a page shows more than one paginated list, each Pagination MUST have a distinct `label` that names its list, such as "Workflow pages". The default label "Pagination" is only acceptable for a single list.
- **IN-3** When `count` or `pageSize` changes outside the component, the caller MUST keep `page` within the new range, for example by returning to page 1. The component resets `page` only when the page size is changed through its own select.
- **IN-4** `type="link"` MUST be paired with `getPageUrl`, and each URL MUST load the page it names. Use links when the page belongs in the URL, so it can be bookmarked or opened in a new tab. Use buttons when the page is local state.
- **IN-5** Pass `pageSizeOptions` only when people need to choose the page size. The current `pageSize` SHOULD be one of the options.
- **IN-6** `formatSummary`, `pageSizeLabel`, `label` and `translations` (previous and next labels, and the per-page label) SHOULD be translated.
- **IN-7** `class` is merged onto the `nav` through `twMerge`. It MAY set layout and spacing. It MUST NOT restyle the page items or triggers.

## Behavior

- **BEH-1** Changing the page through the component sets `page` and calls `onPageChange`. Changing the page size through the select sets `pageSize`, returns `page` to 1, and calls `onPageSizeChange`.
- **BEH-2** The `full` variant shows numbered pages with ellipses, based on `siblingCount` and `boundaryCount`. The `compact` variant shows only the summary and the previous and next triggers.
- **BEH-3** On the first and last page, the previous or next trigger is disabled. In link mode it renders as an `<a>` without `href`.
- **BEH-4** The summary defaults to "start–end of count", and to "0 results" when `count` is 0.

## Display

- **DIS-1** Items and triggers are 32px squares at minimum. The current page uses the primary interactive fill.
- **DIS-2** The summary and the controls sit at opposite ends and wrap onto separate lines when space is narrow.

## Accessibility

- **A11Y-1** The root is a `nav` landmark named by `label`. The current page has `aria-current="page"`.
- **A11Y-2** The previous and next triggers are icon-only and are named through `translations`. Page items are named "page N" by default; `translations.itemLabel` MAY replace that.
- **A11Y-3** The summary has `aria-live="polite"`, so the new range is announced after a page change. Callers MUST NOT add another live region for the same change.

## Test hooks

- **TEST-1** The component sets no `data-testid`. A `data-testid` passed by the caller lands on the `nav`. Tests SHOULD find pages and triggers by their accessible names.

## Known gaps

None found by reading the code.

## Decisions

- **DEC-1** Open. In link mode a disabled previous or next trigger renders as an `<a>` without `href`, which is skipped by the keyboard and announced as plain text. Decide whether to keep that, or render a disabled button instead.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Set `sourceCommit` to `40ba43dab`. The rules above were reconciled against the source at that commit; no rule changes.
