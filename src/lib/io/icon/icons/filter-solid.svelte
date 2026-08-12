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
    d="M0 2V.5h16v2L10.5 9v6.5L9 14.3l-3.5-2.8V9L0 2.5z"
  />
</IconSvgWrapper>
