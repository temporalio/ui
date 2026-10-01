<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path fill="currentColor" d="M3 9.5 8 5l5 4.5V11H3z" />
</IconSvgWrapper>
