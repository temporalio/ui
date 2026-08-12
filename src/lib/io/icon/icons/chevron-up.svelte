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
    d="M7.998 3.94 15.061 11l-1.062 1.06-6-6-6 6.003L.938 11 8 3.938z"
  />
</IconSvgWrapper>
