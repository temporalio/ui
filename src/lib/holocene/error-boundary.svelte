<script lang="ts">
  import type { Snippet } from 'svelte';

  import Error from './error.svelte';

  let { children }: { children?: Snippet } = $props();
</script>

<svelte:boundary>
  {@render children?.()}
  {#snippet failed(error, reset)}
    <Error {reset} {error} />
  {/snippet}
</svelte:boundary>
