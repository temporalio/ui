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
    fill-rule="evenodd"
    d="M6.667 3.333a1.333 1.333 0 1 1 2.666 0 1.333 1.333 0 0 1-2.666 0m0 4.667a1.333 1.333 0 1 1 2.666 0 1.333 1.333 0 0 1-2.666 0m0 4.667a1.333 1.333 0 1 1 2.666 0 1.333 1.333 0 0 1-2.666 0"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
