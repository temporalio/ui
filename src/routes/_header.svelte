<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import NamespaceSelect from '$lib/components/select/namespace-select.svelte';

  export async function load({ fetch }: LoadInput) {
    const { user }: any = await requestFromAPI('/me', { request: fetch });

    return {
      props: { user },
    };
  }
</script>

<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import DataConvertorStatus from '$lib/components/data-convertor-status.svelte';
  import NavigationLink from './_navigation-link.svelte';
  export let user: { name?: string; email?: string; picture?: string } = {};
</script>

<div
  id="header"
  class="h-16 w-full px-6 flex flex-row items-center justify-between bg-gray-900 border-b-2"
>
  <div class="flex flex-row justify-center items-center">
    <img src="/logo.svg" alt="Temporal Logo" />
    <NamespaceSelect />
    <NavigationLink href={`/namespaces/${$namespace}/workflows`}>
      Workflows
    </NavigationLink>
    <NavigationLink href={`/namespaces/${$namespace}/settings`}>
      Settings
    </NavigationLink>
  </div>
  <div class="flex flex-row justify-center items-center">
    <DataConvertorStatus />
    <a href="https://github.com/temporalio/web/issues/new/choose">
      Report Bug/Give Feedback
    </a>
    {#if user.email}
      <span href={`/namespaces/${$namespace}/settings`}>
        {user.email}
      </span>
    {:else}
      <a href={import.meta.env.VITE_API + '/auth/sso'}> Sign In </a>
    {/if}
  </div>
</div>

<style lang="postcss">
  #header {
    @apply bg-black;
  }

  img {
    @apply w-10 mr-2;
  }
  a {
    @apply block px-4 py-2 text-sm text-white;
  }

  a:hover {
    @apply bg-purple-100 rounded-md text-black;
  }
</style>
