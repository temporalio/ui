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
    d="M1.5 1v12.5H16V15H0V1zM4 3.5h5V5H4zm2.75 3H12V8H6V6.5zm5 3H15V11h-4V9.5z"
  />
</IconSvgWrapper>
