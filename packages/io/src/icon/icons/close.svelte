<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m13.4 3.8.6-.6-1.2-1.196-.6.6-4.2 4.2L3.8 2.6 3.2 2 2.004 3.2l.6.6 4.2 4.2L2.6 12.2l-.6.6 1.2 1.196.6-.6 4.2-4.2 4.2 4.204.6.6 1.196-1.2-.6-.6-4.2-4.2z"
  />
</IconSvgWrapper>
