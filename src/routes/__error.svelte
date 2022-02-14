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
  import Error from '$lib/components/error.svelte';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  export let error;
  export let status;
  let requestFromAPIError;

  try {
    requestFromAPIError = JSON.parse(error.message);
    if (isNetworkError(requestFromAPIError)) {
      status = requestFromAPIError.statusCode;
    }
  } catch (e) {}
</script>

<Error {error} />
