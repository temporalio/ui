<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M12.7188 0L4.9375 16H3.28125L11.0312 0H12.7188Z"
  />
</IconSvgWrapper>
