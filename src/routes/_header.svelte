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
  import { decryptPort, lastDecryptStatus } from '$lib/stores/decrypt';
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
    {#if $decryptPort}
      {#if $lastDecryptStatus === null}
        <Tooltip text={'Decryption is on but has not decrypted a payload'}>
          <Icon src={StatusOffline} class="mx-auto text-gray-400 w-8 h-8" />
        </Tooltip>
      {:else if $lastDecryptStatus === false}
        <Tooltip
          text={'Decryption is on last message decryption was a failure'}
        >
          <Icon src={StatusOffline} class="mx-auto text-red-400 w-8 h-8" />
        </Tooltip>
      {:else if $lastDecryptStatus == true}
        <Tooltip text={'Decryption is on but last decryption was a success'}>
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
