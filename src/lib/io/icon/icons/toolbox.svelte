<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M4 1h8v3h1.5L16 6.5V15H0V6.5L2.5 4H4zm-2.5 9.75v2.75h13v-2.75h-3V12H10v-1.25H6V12H4.5v-1.25zm13-1.5V7.122L12.878 5.5H3.122L1.5 7.122V9.25h3V8H6v1.25h4V8h1.5v1.25zm-4-6.75h-5V4h5z"
  />
</IconSvgWrapper>
