<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    fill-opacity=".75"
    fill-rule="evenodd"
    d="M11.973 10.659h-7.33a.34.34 0 0 0-.231.587l4.71 4.396a.74.74 0 0 0 .505.199h4.15z"
    clip-rule="evenodd"
  /><path
    fill="currentColor"
    fill-opacity=".5"
    fill-rule="evenodd"
    d="M5.24 1.035a.74.74 0 0 0-.702.504L.041 14.863a.74.74 0 0 0 .701.978h3.62a.74.74 0 0 0 .701-.504l.894-2.649-1.545-1.442a.34.34 0 0 1 .231-.587h2l3.246-9.624z"
    clip-rule="evenodd"
  /><path
    fill="currentColor"
    fill-rule="evenodd"
    d="M11.17 1.539a.74.74 0 0 0-.7-.504H5.263h.023c.318 0 .6.203.701.504l4.498 13.324a.74.74 0 0 1-.701.978h-.08 5.262a.74.74 0 0 0 .7-.978z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
