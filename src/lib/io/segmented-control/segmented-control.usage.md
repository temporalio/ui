## Usage

```ts
import {
  SegmentedControl,
  Segment,
  SegmentLink,
} from '$lib/io/segmented-control';
```

The wrapper provides layout; the parent owns selection and event handling. Set
`selected` on the active item. Segment supports `isLoading` and `disabled`.
SegmentLink sets `aria-current="page"` when selected. This component does not
implement a tablist or automatic arrow-key navigation.

## Selection

Segmented Controls let users switch between a small set of related options or views, with one option selected at a time. Use them to change how content is shown or to move between closely related pages, such as the history, workers, and relationships views of a workflow.

| Do                                                                                                                   | Don't                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **USE-1** Keep to a small set of options, usually two to five, so every option is visible at once.                   | **USE-2** Don't use a segmented control for many options. Use a select or tabs when the list is long or may grow. |
| **USE-3** Always show one option as selected, so users can see the current view at a glance.                         | **USE-4** Don't use segments for actions such as Save or Delete. Use Button for actions.                          |
| **USE-5** Use `SegmentLink` with `element="nav"` and an accessible label when segments move between pages.           | **USE-6** Don't mix `Segment` buttons and `SegmentLink` anchors in the same control.                              |
| **USE-7** Pass `aria-pressed` to `Segment` buttons that change the current view, so the selected state is announced. | **USE-8** Don't rely on counts alone to label segments. Each segment needs a short text label.                    |
| **USE-9** Let the control sit at its natural width, sized by its segment labels.                                     | **USE-10** Don't stretch a segmented control to fill its container. Segments should stay as wide as their labels. |

## Rules

Checked against every PR that uses this component.

### Accessibility

- **A11Y-1** Callers MUST NOT assign tablist or tab semantics unless they also implement the corresponding keyboard behavior and panel relationships. These components do not supply a tabs interaction model.

## Notes

How the component behaves. Context for reviewers; not checked.

- **BEH-1** SegmentedControl provides a div or nav wrapper. Segment renders a native button, and SegmentLink renders a native anchor.
- **BEH-2** `selected` sets `data-selected` and styles on both child components. SegmentLink also supplies `aria-current="page"`; Segment does not set `aria-pressed`.
- **BEH-3** Segment `isLoading` sets `aria-busy` and replaces its icon with a spinner; it does not disable clicks.
- **BEH-4** A provided count, including zero, renders verbatim. The internal `data-segment-count` marks that span.
- **BEH-5** Native attributes, including `data-testid`, reach the wrapper or the individual child to which they are passed. No test ID is assigned internally.
