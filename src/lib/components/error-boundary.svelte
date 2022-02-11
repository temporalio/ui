<script lang="ts">
  import { networkError } from '$lib/stores/error';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import Error from './error.svelte';

  export let error = null;
  export let onError = null;

  let theError;

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
