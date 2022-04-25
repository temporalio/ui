<script context="module" lang="ts">
  import type { ErrorLoad } from '@sveltejs/kit';
  import { fetchSettings } from '$lib/services/settings-service';
  import { fetchUser } from '$lib/services/user-service';

  import '../app.css';

  export const load: ErrorLoad = async function ({
    error,
    status,
    url,
    fetch,
  }) {
    const settings: Settings = await fetchSettings({ url }, fetch);
    const user = await fetchUser(fetch);

    return {
      stuff: {
        settings,
      },
      props: {
        error,
        status,
        settings,
        user,
      },
    };
  };
</script>

<script lang="ts">
  import Header from './_header.svelte';
  import HeaderResponsive from './_header-responsive.svelte';
  import Error from '$lib/components/error.svelte';
  import { isNetworkError } from '$lib/utilities/is-network-error';

  export let error: globalThis.Error;
  export let status: number;
  export let user: User;

  let requestFromAPIError: Record<string, any>;

  try {
    requestFromAPIError = JSON.parse(error.message);

    if (isNetworkError(requestFromAPIError)) {
      status = requestFromAPIError.statusCode;
    }
  } catch (e) {}
</script>

<Header {user} />
<HeaderResponsive {user} />
<Error {error} {status} />
