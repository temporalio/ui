<script lang="ts">
  import Icon from 'svelte-fa';

  import {
    faExclamationTriangle,
    faLongArrowAltDown,
    faLongArrowAltUp,
  } from '@fortawesome/free-solid-svg-icons';

  import {
    dataEncoder,
    lastDataEncoderStatus,
  } from '$lib/stores/data-encoder-config';

  import {
    dataConverterPort,
    lastDataConverterStatus,
  } from '$lib/stores/data-converter-config';

  import Tooltip from '$lib/components/tooltip.svelte';
  $: notRequested = $dataConverterPort
    ? $lastDataConverterStatus === 'notRequested'
    : $lastDataEncoderStatus === 'notRequested';
  $: error = $dataConverterPort
    ? $lastDataConverterStatus === 'error'
    : $lastDataEncoderStatus === 'error';
  $: success = $dataConverterPort
    ? $lastDataConverterStatus === 'success'
    : $lastDataEncoderStatus === 'success';

  const clearPort = () => {
    $dataConverterPort = null;
  };
</script>

{#if $dataEncoder?.endpoint && $dataConverterPort}
  <Tooltip
    left
    text={'Both data encoder endpoint and port are configured. Click to clear port.'}
  >
    <div class="flex mr-1" on:click={clearPort}>
      <Icon
        icon={faExclamationTriangle}
        scale={1}
        class="text-orange-200 block w-full h-full"
      />
    </div>
  </Tooltip>
{/if}
{#if $dataEncoder?.endpoint || $dataConverterPort}
  {#if notRequested}
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
  {:else if error}
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
  {:else if success}
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
