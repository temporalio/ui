<script lang="ts">
  import { networkError } from '$lib/stores/error';
  import Error from './error.svelte';

  export let error: any = null;
  export let onError: any = null;

  let theError: any;

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
  }
</script>

{#if $theError}
  <Error error={$theError} />
{:else}
  <slot />
{/if}
