## Usage

```ts
import { RoundnessGroup } from '$lib/io/roundness-group';
```

Put segments directly inside the group and use `class="inline-flex"` to arrange
them side by side. `roundness` controls the outer corners.

`roundnessTarget="children"` rounds the outer child corners. Wrapper mode rounds
the group itself and subtracts `--group-border-width` from the inner radius;
set that variable when the wrapper owns a border.

`innerBorderHandling="collapse"` removes right borders between segments.
`erase` removes both adjoining borders, and `none` leaves borders alone. Keep
colors and border widths on the elements that own each segment's shape.
