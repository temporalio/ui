## Usage

```ts
import { RoundnessGroup } from '$lib/io/roundness-group';
```

Put segments directly inside the group and use `class="inline-flex"` to arrange
them side by side. `roundness` controls the outer corners.

`innerBorderHandling="collapse"` removes right borders between segments.
`none` leaves borders alone. Keep colors and border widths on the elements that
own each segment's shape.
