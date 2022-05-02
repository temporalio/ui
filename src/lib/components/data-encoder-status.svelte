<script lang="ts">
  import Icon from 'svelte-fa';

  import {
    faExclamationTriangle,
    faLongArrowAltDown,
    faLongArrowAltUp,
  } from '@fortawesome/free-solid-svg-icons';

  import { dataEncoder } from '$lib/stores/data-encoder';

  import { dataConverterPort } from '$lib/stores/data-converter-config';

  import Tooltip from '$lib/components/tooltip.svelte';
</script>

{#if $dataEncoder?.hasEndpointAndPortConfigured}
  <Tooltip
    left
    text={'Both data encoder endpoint and port are configured. Click to clear port.'}
  >
    <div class="flex mr-1" on:click={() => ($dataConverterPort = null)}>
      <Icon
        icon={faExclamationTriangle}
        scale={1}
        class="text-orange-200 block w-full h-full"
      />
    </div>
  </Tooltip>
{/if}
{#if $dataEncoder?.hasEndpointOrPortConfigured}
  {#if $dataEncoder?.hasNotRequested}
    <Tooltip left text={'Data encoder is configured'}>
      <div class="flex">
        <Icon
          icon={faLongArrowAltDown}
          scale={1}
          class="text-blue-200 block w-full h-full"
        />
        <Icon
          icon={faLongArrowAltUp}
          scale={1}
          class="text-blue-200 block w-full h-full"
        />
      </div>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip left text={`Data encoder couldn't connect to the remote encoder`}>
      <div class="flex">
        <Icon
          icon={faLongArrowAltDown}
          scale={1}
          class="text-red-400 block w-full h-full"
        />
        <Icon
          icon={faLongArrowAltUp}
          scale={1}
          class="text-red-400 block w-full h-full"
        />
      </div>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip left text={'Data encoder succesfully converted content'}>
      <div class="flex">
        <Icon
          icon={faLongArrowAltDown}
          scale={1}
          class="text-green-400 block w-full h-full"
        />
        <Icon
          icon={faLongArrowAltUp}
          scale={1}
          class="text-green-400 block w-full h-full"
        />
      </div>
    </Tooltip>
  {/if}
{/if}
