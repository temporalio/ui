<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M5.5 4v2h5V4a2.5 2.5 0 1 0-5 0M4 6V4a4 4 0 1 1 8 0v2h3v10H1V6zm-1.5 8.5h11v-7h-11z"
  />
</IconSvgWrapper>
