<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import { dataEncoder } from '$lib/stores/data-encoder';
  import { showDataEncoderSettings } from '$lib/stores/show-data-encoder';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import DataEncoderSettings from './data-encoder-settings.svelte';

  const onIconClick = () => ($showDataEncoderSettings = true);
  const onCancel = () => ($showDataEncoderSettings = false);
</script>

<DataEncoderSettings
  showSettings={$showDataEncoderSettings}
  {onCancel}
  passAccessToken={$dataEncoder.passAccessToken}
/>
{#if $dataEncoder?.hasEndpointOrPortConfigured}
  {#if $dataEncoder?.hasNotRequested}
    <Tooltip right text={'Data encoder is configured'}>
      <button
        class="relative flex cursor-pointer"
        data-cy="data-encoder-status-configured"
        on:click={onIconClick}
      >
        <Icon name="converter-down" class="-ml-1 text-blue-200" />
        <Icon name="converter-up" class="absolute left-1 text-blue-200" />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip right text={`Data encoder couldn't connect to the remote encoder`}>
      <button
        class="relative flex cursor-pointer"
        data-cy="data-encoder-status-error"
        on:click={onIconClick}
      >
        <Icon name="converter-down" class="-ml-1 text-red-400" />
        <Icon name="converter-up" class="absolute left-1 text-red-400" />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip right text={'Data encoder succesfully converted content'}>
      <button
        class="relative flex cursor-pointer"
        data-cy="data-encoder-status-success"
        on:click={onIconClick}
      >
        <Icon name="converter-down" class="-ml-1 text-green-400" />
        <Icon name="converter-up" class="absolute left-1 text-green-400" />
      </button>
    </Tooltip>
  {/if}
{:else}
  <Tooltip right text={'Configure data encoder'}>
    <button
      class="relative flex cursor-pointer"
      data-cy="data-encoder-status"
      on:click={onIconClick}
    >
      <Icon name="converter-down" class="-ml-1 text-gray-400" />
      <Icon name="converter-up" class="absolute left-1 text-gray-400" />
    </button>
  </Tooltip>
{/if}
