<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import NamespaceDropdown from '$lib/components/namespace-dropdown.svelte';

  export async function load({ fetch }: LoadInput) {
    const { user }: any = await requestFromAPI('/me', { request: fetch });

    return {
      props: { user },
    };
  }
</script>

<div
  id="header"
  class="h-16 w-full px-6 flex flex-row items-center justify-end static border-b-2"
>
  <NamespaceDropdown />
</div>
