<script lang="ts">
  import { StatusOnline, StatusOffline } from 'svelte-hero-icons';
  import {
    dataConverterPort,
    lastDataConverterStatus,
  } from '$lib/stores/data-converter-config';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import Tooltip from '$lib/components/tooltip.svelte';
</script>

{#if $dataConverterPort}
  {#if $lastDataConverterStatus === 'notRequested'}
    <Tooltip text={'Data converter is configured'}>
      <Icon src={StatusOffline} class="mx-auto text-gray-400 w-8 h-8" />
    </Tooltip>
  {:else if $lastDataConverterStatus === 'error'}
    <Tooltip text={`Data converter couldn't connect to the remote converter`}>
      <Icon src={StatusOffline} class="mx-auto text-red-400 w-8 h-8" />
    </Tooltip>
  {:else if $lastDataConverterStatus === 'success'}
    <Tooltip text={'Data converter succesfully converted content'}>
      <Icon src={StatusOnline} class="mx-auto text-green-500 w-8 h-8" />
    </Tooltip>
  {/if}
{/if}
