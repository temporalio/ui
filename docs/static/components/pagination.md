# Pagination

Move through a long list one page at a time.

## Anatomy

Pagination combines a range summary, an optional page size choice, and page controls.

- **Root** `[data-scope="pagination"][data-part="root"]`: The navigation landmark, named by `label`.
  - **Summary** `[data-scope="pagination"][data-part="root"] > p` (top): The range of items shown, such as "1–25 of 340".
  - **Prev trigger** `prev-trigger` (bottom): Goes to the previous page.
  - **Item** `[data-part="item"][data-selected]` (top): Goes to one page. Marked as current on the active page.
  - **Ellipsis** `ellipsis` (bottom): Stands in for pages that are not shown.
  - **Next trigger** `next-trigger` (right): Goes to the next page.

## Examples

Use the full variant below a list of workflows and the compact variant in table
footers and narrow panels. Add page size options when people need to see more
results at once.

## Usage

### Import

```svelte
<script lang="ts">
  import { Pagination } from '$lib/io-poc/pagination';
  let page = $state(1);
  let pageSize = $state(25);
</script>

<Pagination
  count={340}
  bind:page
  bind:pageSize
  pageSizeOptions={[25, 50, 100]}
  label="Workflow pages"
/>
```

Package consumers can import from `@temporalio/ui/io-poc/pagination`.

### Page state

`page` starts at 1. `count` is the total number of items, not pages. Changing the page
size returns to the first page so the visible range stays valid.

### Variants

`full` shows numbered pages with ellipses for long ranges. `compact` shows only the
range summary with previous and next buttons. Use `siblingCount` and `boundaryCount`
to control how many page numbers appear around the current page and at each end.

### Links

Set `type` to `link` and provide `getPageUrl` when each page has its own URL, so pages
can be bookmarked and opened in a new tab. Buttons are best when the page is kept in
local state.

### Accessibility

Pagination renders a `nav` landmark. Give it a `label` when the page has more than one
paginated list. The current page has `aria-current="page"`, and previous and next
buttons have accessible labels that you can change with `translations`. The range
summary is announced politely when it changes.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/pagination/pagination.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

### Pagination

Pagination forwards native attributes to its `nav` element.

| Prop               | Type                                                      | Default              | Description                                             |
| ------------------ | --------------------------------------------------------- | -------------------- | ------------------------------------------------------- |
| `count`            | `number`                                                  | `Required`           | Total number of items.                                  |
| `page`             | `number (bindable)`                                       | `1`                  | The current page, starting at 1.                        |
| `pageSize`         | `number (bindable)`                                       | `25`                 | Items per page.                                         |
| `variant`          | `full \| compact`                                         | `full`               | Numbered pages or a compact previous/next control.      |
| `siblingCount`     | `number`                                                  | `1`                  | Page numbers shown on each side of the current page.    |
| `boundaryCount`    | `number`                                                  | `1`                  | Page numbers always shown at the start and end.         |
| `type`             | `button \| link`                                          | `button`             | Render pages as buttons or links.                       |
| `getPageUrl`       | `(details: { page: number; pageSize: number }) => string` | `—`                  | Builds the URL for each page when `type` is link.       |
| `label`            | `string`                                                  | `Pagination`         | Accessible name for the navigation landmark.            |
| `showSummary`      | `boolean`                                                 | `true`               | Shows the visible range, such as 1–25 of 340.           |
| `formatSummary`    | `(details: PaginationSummaryDetails) => string`           | `start–end of count` | Formats the range summary.                              |
| `pageSizeOptions`  | `number[]`                                                | `—`                  | Shows a page size select with these options.            |
| `pageSizeLabel`    | `string`                                                  | `Per page`           | Label for the page size select.                         |
| `translations`     | `PaginationTranslations`                                  | `—`                  | Accessible labels for previous, next, and page buttons. |
| `onPageChange`     | `(details: { page: number; pageSize: number }) => void`   | `—`                  | Called when a person changes the page.                  |
| `onPageSizeChange` | `(details: { pageSize: number }) => void`                 | `—`                  | Called when a person changes the page size.             |
| `id`               | `string`                                                  | `Generated`          | Base for internal IDs.                                  |
| `class`            | `string`                                                  | `—`                  | Additional Tailwind classes on the root.                |

### PaginationTranslations

| Prop               | Type                                                        | Default         | Description                    |
| ------------------ | ----------------------------------------------------------- | --------------- | ------------------------------ |
| `prevTriggerLabel` | `string`                                                    | `Previous Page` | Label for the previous button. |
| `nextTriggerLabel` | `string`                                                    | `Next Page`     | Label for the next button.     |
| `itemLabel`        | `(details: { page: number; totalPages: number }) => string` | `—`             | Label for each page button.    |
