<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import IconExternalLink from '../icons/external-link.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <IconExternalLink x={2.667} y={2.667} width={10.667} height={10.667} />
</IconSvgWrapper>
