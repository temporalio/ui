## Usage

```ts
import {
  SegmentedControl,
  Segment,
  SegmentLink,
} from '$lib/io/segmented-control';
```

Segmented Controls let users switch between a small set of related options or views, with one option selected at a time. Use them to change how content is shown or to move between closely related pages, such as the history, workers, and relationships views of a workflow.

| Do                                                                                                         | Don't                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Keep to a small set of options, usually two to five, so every option is visible at once.                   | Don't use a segmented control for many options. Use a select or tabs when the list is long or may grow. |
| Always show one option as selected, so users can see the current view at a glance.                         | Don't use segments for actions such as Save or Delete. Use Button for actions.                          |
| Use `SegmentLink` with `element="nav"` and an accessible label when segments move between pages.           | Don't mix `Segment` buttons and `SegmentLink` anchors in the same control.                              |
| Pass `aria-pressed` to `Segment` buttons that change the current view, so the selected state is announced. | Don't rely on counts alone to label segments. Each segment needs a short text label.                    |
| Let the control sit at its natural width, sized by its segment labels.                                     | Don't stretch a segmented control to fill its container. Segments should stay as wide as their labels.  |

The wrapper provides layout; the parent owns selection and event handling. Set
`selected` on the active item. Segment supports `isLoading` and `disabled`.
SegmentLink sets `aria-current="page"` when selected. This component does not
implement a tablist or automatic arrow-key navigation.
