<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import IconSvgWrapper from '../icon-svg-wrapper.svelte';

  const props: Omit<
    ComponentProps<typeof IconSvgWrapper>,
    'children'
  > = $props();
</script>

<IconSvgWrapper {...props}>
  <path fill="currentColor" d="M7.25 0h1.5v16h-1.5z" /><path
    fill="currentColor"
    d="m14.788 3.7.68 1.336L1.213 12.3l-.68-1.336z"
  /><path fill="currentColor" d="m1.212 3.7-.68 1.336L14.787 12.3l.68-1.336z" />
</IconSvgWrapper>
