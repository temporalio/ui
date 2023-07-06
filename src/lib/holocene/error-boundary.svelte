<script lang="ts">
  import { networkError } from '$lib/stores/error';
  import type { NetworkError } from '$lib/types/global';
  
  import Error from './error.svelte';

  export let error = null;
  export let onError = null;

  let theError: NetworkError;

  $: {
    if (error && $error) {
      theError = error;
    }
    if (networkError && $networkError) {
      theError = $networkError;
    }

    if (onError && theError) {
      onError(theError);
    }
  }
  function clearError() {
    $error = null;
    onError = null;
    theError = null;
    $networkError = null;
  }
</script>

{#if theError}
  <Error on:clearError={clearError} error={theError} />
{:else}
  <slot />
{/if}
