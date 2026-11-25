## Usage

```ts
import { RoundnessGroup } from '$lib/io/roundness-group';
```

Roundness Group joins adjoining segments into one shape by rounding only the outer corners and merging the borders between them. It is a building block for other components, such as the segmented labels in Badge, Badge Count, and Tag, rather than something users see on its own.

| Do                                                                                                                | Don't                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Use it when building a component whose segments should read as one shape, such as a label with an attached value. | Don't use it to lay out unrelated items. Segments should belong together, or the shared shape is misleading.                 |
| Put segments directly inside the group, so it can find the first and last segment.                                | Don't wrap segments in extra elements. The group only shapes its direct children.                                            |
| Keep colors and border widths on the elements that own each segment's shape.                                      | Don't set rounded corners on the segments yourself. Let `roundness` control the outer corners.                               |
| Use an existing component, such as Badge or Tag, before building a new segmented one.                             | Don't give the group its own border in wrapper mode without setting `--group-border-width`. The inner corners won't line up. |

`class="inline-flex"` arranges segments side by side. `roundness` controls the
outer corners.

`roundnessTarget="children"` rounds the outer child corners. Wrapper mode rounds
the group itself and subtracts `--group-border-width` from the inner radius;
set that variable when the wrapper owns a border.

`innerBorderHandling="collapse"` removes right borders between segments.
`erase` removes both adjoining borders, and `none` leaves borders alone.
