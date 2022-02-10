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
  import { networkError } from '$lib/stores/error-store';
  import Error from '$lib/components/error.svelte';

  export let error;
  export let status;
  let requestFromAPIError;
  console.log(error);
  try {
    requestFromAPIError = JSON.parse(error.message);
    if (isNetworkError(requestFromAPIError)) {
      status = requestFromAPIError.statusCode;
    }
  } catch (e) {
    //
  }
</script>

<Error {error} />
