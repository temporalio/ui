<script lang="ts">
  import Icon from 'svelte-fa';

  import {
    faLongArrowAltDown,
    faLongArrowAltUp,
  } from '@fortawesome/free-solid-svg-icons';

  import { dataEncoder } from '$lib/stores/data-encoder';

  import Tooltip from '$lib/components/tooltip.svelte';
  import DataEncoderSettings from './data-encoder-settings.svelte';

  let showSettings = false;

  const onCancel = () => (showSettings = false);
</script>

<DataEncoderSettings {showSettings} {onCancel} />
{#if $dataEncoder?.hasEndpointOrPortConfigured}
  {#if $dataEncoder?.hasNotRequested}
    <Tooltip left text={'Data encoder is configured'}>
      <div class="flex cursor-pointer" on:click={() => (showSettings = true)}>
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
      <div class="flex cursor-pointer" on:click={() => (showSettings = true)}>
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
      <div class="flex cursor-pointer" on:click={() => (showSettings = true)}>
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
{:else}
  <Tooltip left text={'Configure data encoder'}>
    <div class="flex cursor-pointer" on:click={() => (showSettings = true)}>
      <Icon
        icon={faLongArrowAltDown}
        scale={1}
        class="text-gray-200 block w-full h-full"
      />
      <Icon
        icon={faLongArrowAltUp}
        scale={1}
        class="text-gray-200 block w-full h-full"
      />
    </div>
  </Tooltip>
{/if}
