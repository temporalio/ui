# Icon

The `<Icon />` component allows for rendering of SVG Icons in our app. It is designed to support SVG's with 24x24 viewboxes only! To add a new icon, follow these steps:

1. Obtain the SVG markup from a designer. Make sure it is 24x24px!
2. Create a new Svelte component in `src/lib/holocene/icon/svg` with the following contents. _Note: It's important to spread `$$props` here!_

```
<script lang="ts">
  import Svg from './svg.svelte';
</script>

<Svg {...$$props}></Svg>
```

3. Take the `<path />` element(s) from your SVG markup, and paste them in the default slot of the `<Svg />` Component.
4. Add your new icon to the `icons` object in `src/lib/holocene/icon/paths.ts`.
