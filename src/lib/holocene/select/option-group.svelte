<script lang="ts">
  import type { Snippet } from 'svelte';

  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface Props {
    label: string;
    children?: Snippet;
  }

  const { label, children }: Props = $props();
</script>

<MenuItem disabled>
  {label}
</MenuItem>
{@render children?.()}
