<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import IconSvgWrapper from '../icon-svg-wrapper.svelte';

  const props: Omit<
    ComponentProps<typeof IconSvgWrapper>,
    'children'
  > = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M5.75.75V0h-1.5v2H1v14h14V2h-3.25V0h-1.5v2h-4.5zM2.5 6h11v8.5h-11z"
  />
</IconSvgWrapper>
