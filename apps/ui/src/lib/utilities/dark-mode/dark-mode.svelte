<script lang="ts">
  import type { Snippet } from 'svelte';

  import { darkMode } from './dark-mode';

  let { children }: { children?: Snippet } = $props();
</script>

<svelte:body use:darkMode />
{@render children?.()}
