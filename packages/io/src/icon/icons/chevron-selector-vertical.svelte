<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    stroke="currentColor"
    stroke-linecap="square"
    stroke-width="1.5"
    d="M5.222 10.222 8 13l2.778-2.778M5.222 5.778 8 3l2.778 2.778"
  />
</IconSvgWrapper>
