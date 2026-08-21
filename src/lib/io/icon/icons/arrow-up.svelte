<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8.533.531 8.002 0 7.47.531l-4.25 4.25-.53.532 1.062 1.059.53-.531 2.97-2.97V16h1.5V2.872L11.72 5.84l.532.53 1.059-1.059-.531-.53z"
  />
</IconSvgWrapper>
