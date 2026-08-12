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
    d="M1.684 7.21h12.632v1.58H1.684zm2.526 4.211h7.58V13H4.21zM0 3h16v1.579H0z"
  />
</IconSvgWrapper>
