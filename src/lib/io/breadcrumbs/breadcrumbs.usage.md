## Usage

```ts
import { Breadcrumbs } from '$lib/io/breadcrumbs';
```

Pass `items` in hierarchy order, each with a `label` and `href`. The final item
receives `aria-current="page"`; separators are decorative. The navigation has a
translated accessible label, which can be overridden with `aria-label`.

Keep labels short and meaningful. The trail wraps when space is constrained.
