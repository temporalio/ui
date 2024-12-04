<script context="module" lang="ts">
  import '../app.css';
</script>

<script lang="ts">
  import { page } from '$app/stores';

  import Error from '$lib/holocene/error.svelte';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  $: error = $page.error;
  $: status = $page.status;
  let requestFromAPIError: Record<string, unknown>;

  try {
    requestFromAPIError = parseWithBigInt(error?.message);

    if (isNetworkError(requestFromAPIError)) {
      status = requestFromAPIError.statusCode;
    }
  } catch (e) {
    console.error(e);
  }
</script>

<Error {error} {status} />
