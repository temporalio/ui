<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path fill="currentColor" d="m2 0 12 8-12 8z" />
</IconSvgWrapper>
