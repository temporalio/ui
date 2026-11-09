## Usage

```ts
import { IconAdd } from '$lib/io/icon';
```

Import named icons from `$lib/io/icon`. Icons inherit the current text color
unless the glyph defines its own colors. Use `width` and `height` to size the SVG.

Icons are decorative by default. Supply `title`, `aria-label`, or
`aria-labelledby` when an icon communicates information on its own. For an
icon-only button, label the button instead. Optical variants keep the outer
box size while adjusting the glyph within it.

The Contact Sheet story in the sidebar is generated from the icon barrel, so
newly exported icons appear automatically.
