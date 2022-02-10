<script lang="ts">
  import { isNetworkError } from '$lib/utilities/handle-error';
  import { networkError } from '$lib/stores/error-store';
  import Error from './error.svelte';

  export let error = null;
  export let onError = null;

  let theError;

  // We know something broke and was un-recoverable so lets default to 500 and let the throwing code
  // tell us what kind of stuff was broken
  let status = 500;

  $: {
    if (error && $error) {
      theError = error;
    }
    if (networkError && $networkError) {
      theError = networkError;
    }

    if (onError && theError) {
      onError(theError);
    }

    if (isNetworkError($theError)) {
      status = $theError.statusCode;
    }
  }
</script>

{#if $theError}
  <Error error={$theError} />
{:else}
  <slot />
{/if}

<style>
  .error {
    border: 1px solid red;
  }
  .trace {
    font-family: monospace;
  }
</style>
