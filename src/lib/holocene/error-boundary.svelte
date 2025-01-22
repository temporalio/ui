<script lang="ts">
  import type { Snippet } from 'svelte';
  import Error from './error.svelte';

  type $$Props = {
    children: Snippet;
  };

  let { children }: $$Props = $props();
</script>

<svelte:boundary>
  {@render children()}
  {#snippet failed(error, reset)}
    <Error {reset} {error} />
  {/snippet}
</svelte:boundary>
