<script context="module" lang="ts">
  export function load({ error, status }) {
    return {
      props: {
        error,
        status,
      },
    };
  }
</script>

<script lang="ts">
  import { isNetworkError } from '$lib/utilities/handle-error';

  export let error;
  export let status;
  let requestFromAPIError;

  try {
    requestFromAPIError = JSON.parse(error.message);
    if (isNetworkError(requestFromAPIError)) {
      status = requestFromAPIError.statusCode;
      console.log(status);
    }
  } catch (e) {
    //
  }
</script>

<h2>{status}</h2>

{#if status >= 400 && status < 500}
  OMG WE COULDN'T FIND IT
{:else}
  {status}
  <h2>{error}</h2>
{/if}
