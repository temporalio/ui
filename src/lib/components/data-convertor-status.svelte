<script lang="ts">
  import Icon from 'svelte-fa';
  import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
  import {
    dataConverterPort,
    lastDataConverterStatus,
  } from '$lib/stores/data-converter-config';
  import Tooltip from '$lib/components/tooltip.svelte';
</script>

{#if $dataConverterPort}
  {#if $lastDataConverterStatus === 'notRequested'}
    <Tooltip text={'Data converter is configured'}>
      <Icon icon={faUnlock} scale={1} class="text-white block w-full h-full" />
    </Tooltip>
  {:else if $lastDataConverterStatus === 'error'}
    <Tooltip text={`Data converter couldn't connect to the remote converter`}>
      <Icon icon={faUnlock} scale={1} class="text-danger block w-full h-full" />
    </Tooltip>
  {:else if $lastDataConverterStatus === 'success'}
    <Tooltip text={'Data converter succesfully converted content'}>
      <Icon icon={faLock} scale={1} class="text-success block w-full h-full" />
    </Tooltip>
  {/if}
{/if}
