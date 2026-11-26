<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m12.034 13.097-9.13-9.131a6.499 6.499 0 0 0 9.131 9.131m1.06-1.06a6.499 6.499 0 0 0-9.128-9.134l9.13 9.131zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"
  />
</IconSvgWrapper>
