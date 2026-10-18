<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path fill="currentColor" d="M13 6.5 8 11 3 6.5V5h10z" />
</IconSvgWrapper>
