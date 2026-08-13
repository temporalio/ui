<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import IconDrained from '../icons/drained.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <IconDrained x={3} y={3} width={10} height={10} />
</IconSvgWrapper>
