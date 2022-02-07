<script lang="ts">
  import Icon from 'svelte-fa';

  import {
    faLongArrowAltDown,
    faLongArrowAltUp,
  } from '@fortawesome/free-solid-svg-icons';

  import {
    dataConverterEndpoint,
    lastDataConverterStatus,
  } from '$lib/stores/data-converter-config';

  import Tooltip from '$lib/components/tooltip.svelte';
</script>

{#if $dataConverterEndpoint}
  {#if $lastDataConverterStatus === 'notRequested'}
    <Tooltip text={'Data converter is configured'}>
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
  {:else if $lastDataConverterStatus === 'error'}
    <Tooltip text={`Data converter couldn't connect to the remote converter`}>
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
  {:else if $lastDataConverterStatus === 'success'}
    <Tooltip text={'Data converter succesfully converted content'}>
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
  {/if}
{/if}
