<script lang="ts">
  import type { Snippet } from 'svelte';

  import { palette } from './palette';

  let { children }: { children?: Snippet } = $props();
</script>

<svelte:body use:palette />
{@render children?.()}
