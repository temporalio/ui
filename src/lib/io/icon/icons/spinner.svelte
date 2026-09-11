<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M13 8a5 5 0 0 0-5-5H7V1h1a7 7 0 0 1 4.95 11.95l-.707.707-1.414-1.414.707-.707A4.98 4.98 0 0 0 13 8"
  />
</IconSvgWrapper>
