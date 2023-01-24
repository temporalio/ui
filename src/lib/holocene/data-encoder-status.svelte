<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { dataEncoder } from '$lib/stores/data-encoder';
  import { showDataEncoderSettings } from '$lib/stores/show-data-encoder';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import DataEncoderSettings from './data-encoder-settings.svelte';

  const onIconClick = () => ($showDataEncoderSettings = true);
  const onClose = () => ($showDataEncoderSettings = false);
</script>

<DataEncoderSettings showSettings={$showDataEncoderSettings} {onClose} />
{#if $dataEncoder?.hasEndpointOrPortConfigured}
  {#if $dataEncoder?.hasNotRequested}
    <Tooltip right text={'Data encoder is configured'}>
      <button
        class="relative flex items-center"
        data-cy="data-encoder-status-configured"
        on:click={onIconClick}
      >
        <div class="mr-2 ml-1 flex items-center">
          <Icon name="converter-down" class="text-blue-200" />
          <Icon name="converter-up" class="absolute left-3 text-blue-200" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip right text={`Data encoder couldn't connect to the remote encoder`}>
      <button
        class="relative flex items-center"
        data-cy="data-encoder-status-error"
        on:click={onIconClick}
      >
        <div class="mr-2 ml-1 flex items-center">
          <Icon name="converter-down" class="text-red-400" />
          <Icon name="converter-up" class="absolute left-3 text-red-400" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip right text={'Data encoder succesfully converted content'}>
      <button
        class="relative flex items-center"
        data-cy="data-encoder-status-success"
        on:click={onIconClick}
      >
        <div class="mr-2 ml-1 flex items-center">
          <Icon name="converter-down" class="text-green-400" />
          <Icon name="converter-up" class="absolute left-3 text-green-400" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {/if}
{:else}
  <Tooltip right text={'Configure data encoder'}>
    <button
      class="relative flex items-center"
      data-cy="data-encoder-status"
      on:click={onIconClick}
    >
      <div class="mr-2 ml-1 flex items-center">
        <Icon name="converter-down" class="text-gray-400" />
        <Icon name="converter-up" class="absolute left-3 text-gray-400" />
      </div>
      <slot />
    </button>
  </Tooltip>
{/if}
