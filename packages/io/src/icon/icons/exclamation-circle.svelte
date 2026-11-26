<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13M8 16A8 8 0 1 0 8-.001 8 8 0 0 0 8 16m.75-12h-1.5v5h1.5zm-1.5 7.5h1.5V10h-1.5z"
  />
</IconSvgWrapper>
