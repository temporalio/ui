<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m8 10.763.756.44 3.744 2.185V1.5h-9v11.888l3.744-2.185zm-4.5 4.362L2 16V0h12v16l-1.5-.875L8 12.5z"
  />
</IconSvgWrapper>
