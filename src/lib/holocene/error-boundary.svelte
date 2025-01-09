<script>
  import Error from './error.svelte';

  let { children } = $props();
</script>

<svelte:boundary>
  {@render children()}
  {#snippet failed(error, reset)}
    <Error {reset} {error} />
  {/snippet}
</svelte:boundary>
