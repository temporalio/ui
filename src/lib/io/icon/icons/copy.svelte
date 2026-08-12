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
    d="M13.5 10.5h-7v-9h4.878L13.5 3.622zM15 3l-3-3H5v12h10zM2.5 4H1v12h10v-3H9.5v1.5h-7v-9H4V4z"
  />
</IconSvgWrapper>
