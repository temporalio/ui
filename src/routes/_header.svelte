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
  import { settings } from '$lib/stores/settings';
  import NavigationLink from './_navigation-link.svelte';
  export let user: { name?: string; email?: string; picture?: string } = {};
</script>

<header
  class="grid grid-rows-1 grid-cols-12 gap-8 px-10 items-center bg-gray-900 shadow-lg"
>
  <div class="flex gap-4 col-span-3">
    <a href="/" class="block">
      <img src="/logo.svg" alt="Temporal Logo" class="max-h-10" />
    </a>
    <NamespaceSelect />
  </div>
  <div class="flex gap-4 col-span-4">
    <NavigationLink href={`/namespaces/${$namespace}/workflows`}>
      Workflows
    </NavigationLink>
    <NavigationLink href={`/namespaces/${$namespace}/settings`}>
      Settings
    </NavigationLink>
  </div>
  <div class="col-span-2">
    <DataConvertorStatus />
  </div>
  <div class="flex justify-end gap-4 col-span-3">
    <a
      class="header-button"
      href="https://github.com/temporalio/web/issues/new/choose"
    >
      Report Bug/Give Feedback
    </a>
    {#if $settings.auth?.enabled}
      {#if user.email}
        <span href={`/namespaces/${$namespace}/settings`}>
          {user.email}
        </span>
      {:else}
        <a class="header-button" href={import.meta.env.VITE_API + '/auth/sso'}>
          Sign In
        </a>
      {/if}
    {/if}
  </div>
</header>

<style lang="postcss">
  .header-button {
    @apply block px-4 py-2 text-sm text-white;
  }

  .header-button:hover {
    @apply bg-purple-100 rounded-md text-gray-900;
  }
</style>
