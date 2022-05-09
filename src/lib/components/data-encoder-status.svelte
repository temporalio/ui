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

<DataEncoderSettings
  {showSettings}
  {onCancel}
  accessToken={$dataEncoder.accessToken}
/>
{#if $dataEncoder?.hasEndpointOrPortConfigured}
  {#if $dataEncoder?.hasNotRequested}
    <Tooltip left text={'Data encoder is configured'}>
      <button
        class="flex cursor-pointer"
        data-cy="data-encoder-status-configured"
        on:click={() => (showSettings = true)}
      >
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
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip left text={`Data encoder couldn't connect to the remote encoder`}>
      <button
        class="flex cursor-pointer"
        data-cy="data-encoder-status-error"
        on:click={() => (showSettings = true)}
      >
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
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip left text={'Data encoder succesfully converted content'}>
      <button
        class="flex cursor-pointer"
        data-cy="data-encoder-status-success"
        on:click={() => (showSettings = true)}
      >
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
      </button>
    </Tooltip>
  {/if}
{:else}
  <Tooltip left text={'Configure data encoder'}>
    <button
      class="flex cursor-pointer"
      data-cy="data-encoder-status"
      on:click={() => (showSettings = true)}
    >
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
    </button>
  </Tooltip>
{/if}
