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
  import { StatusOnline, StatusOffline } from 'svelte-hero-icons';
  import {
    dataConverterPort,
    lastDataConverterStatus,
  } from '$lib/stores/data-converter-config';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import Tooltip from '$lib/components/tooltip.svelte';
  export let user: { name?: string; email?: string; picture?: string } = {};
</script>

<div
  id="header"
  class="h-16 w-full px-6 flex flex-row items-center justify-between static border-b-2"
>
  <NamespaceSelect />
  <div class="flex flex-row justify-center items-center">
    {#if $dataConverterPort}
      {#if $lastDataConverterStatus === 'notRequested'}
        <Tooltip text={'Data converter is configured'}>
          <Icon src={StatusOffline} class="mx-auto text-gray-400 w-8 h-8" />
        </Tooltip>
      {:else if $lastDataConverterStatus === 'error'}
        <Tooltip
          text={`Data converter couldn't connect to the remote converter`}
        >
          <Icon src={StatusOffline} class="mx-auto text-red-400 w-8 h-8" />
        </Tooltip>
      {:else if $lastDataConverterStatus === 'success'}
        <Tooltip text={'Data converter succesfully converted content'}>
          <Icon src={StatusOnline} class="mx-auto text-green-500 w-8 h-8" />
        </Tooltip>
      {/if}
    {/if}
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
  a {
    @apply block px-4 py-2 text-sm;
  }
  a:hover {
    @apply bg-purple-100 rounded-md;
  }
</style>
