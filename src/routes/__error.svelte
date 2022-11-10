<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import '../app.css';

  export const load: Load = async function ({ error, status }) {
    return {
      props: {
        error,
        status,
      },
    };
  };
</script>

<script lang="ts">
  import Error from '$lib/holocene/error.svelte';
  import { isNetworkError } from '$lib/utilities/is-network-error';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  export let error: globalThis.Error;
  export let status: number;

  let requestFromAPIError: Record<string, any>;

  try {
    requestFromAPIError = parseWithBigInt(error.message);

    if (isNetworkError(requestFromAPIError)) {
      status = requestFromAPIError.statusCode;
    }
  } catch (e) {}
</script>

<Error {error} {status} />
