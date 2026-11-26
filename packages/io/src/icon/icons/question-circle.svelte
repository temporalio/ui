<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M14.5 8a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m5.25-2.25C5.25 4.784 6.034 4 7 4h1.778a1.972 1.972 0 0 1 .981 3.684l-1.009.578v.988h-1.5V7.394l.378-.216 1.384-.794a.473.473 0 0 0-.234-.88H7a.25.25 0 0 0-.25.25v.202h-1.5zm2 4.75h1.5V12h-1.5z"
  />
</IconSvgWrapper>
