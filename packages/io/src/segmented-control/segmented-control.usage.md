## Usage

```ts
import {
  SegmentedControl,
  Segment,
  SegmentLink,
} from '$lib/io/segmented-control';
```

Compose `Segment` buttons or `SegmentLink` anchors inside `SegmentedControl`.
The wrapper provides layout; the parent owns selection and event handling.
Set `selected` on the active item. Segment supports `isLoading` and `disabled`.

For navigation, use `element="nav"` and an accessible label on the wrapper.
SegmentLink sets `aria-current="page"` when selected. For toggle buttons, pass
`aria-pressed` to communicate selection. This component does not implement a
tablist or automatic arrow-key navigation.
