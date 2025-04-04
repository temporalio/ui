<script lang="ts">
  import Error from './error.svelte';
</script>

<svelte:boundary>
  <slot />
  {#snippet failed(error, reset)}
    <Error {reset} {error} />
  {/snippet}
</svelte:boundary>
