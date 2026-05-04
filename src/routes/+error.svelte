<script module lang="ts">
  import '../app.css';
</script>

<script lang="ts">
  import { page } from '$app/state';

  import Error from '$lib/holocene/error.svelte';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  const error = $derived(page.error);
  const status = $derived.by(() => {
    let resolvedStatus: number = page.status;
    let requestFromAPIError: Record<string, unknown>;

    try {
      if (error?.message) {
        requestFromAPIError = parseWithBigInt(error.message);
      }

      if (isNetworkError(requestFromAPIError)) {
        resolvedStatus = requestFromAPIError.statusCode;
      }
    } catch (e) {
      console.error(e);
    }

    return resolvedStatus;
  });
</script>

<Error {error} {status} />
