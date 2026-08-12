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
    d="M.002 12.666v3.332h3.332l9.827-9.827L9.83 2.839zm15.736-9.072a.885.885 0 0 0 0-1.253l-2.08-2.08a.885.885 0 0 0-1.252 0L10.78 1.889l3.332 3.332z"
  />
</IconSvgWrapper>
