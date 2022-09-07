<script>import { networkError } from '../stores/error';
import Error from './error.svelte';
export let error = null;
export let onError = null;
let theError;
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
function clearError() {
    $error = null;
    onError = null;
    theError = null;
    $networkError = null;
}
</script>

{#if theError && $theError}
  <Error on:clearError={clearError} error={$theError} />
{:else}
  <slot />
{/if}
