<script lang="ts">
  import Icon from 'svelte-fa';

  import {
    faLongArrowAltDown,
    faLongArrowAltUp,
  } from '@fortawesome/free-solid-svg-icons';

  import {
    dataEncoderEndpoint,
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
</script>

{#if $dataEncoderEndpoint || $dataConverterPort}
  {#if notRequested}
    <Tooltip left text={'Data converter is configured'}>
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
    <Tooltip
      left
      text={`Data converter couldn't connect to the remote converter`}
    >
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
    <Tooltip left text={'Data converter succesfully converted content'}>
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
