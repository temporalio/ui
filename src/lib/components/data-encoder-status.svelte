<script lang="ts">
  import Icon from 'holocene/components/icon/index.svelte';

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
    <Tooltip right text={'Data encoder is configured'}>
      <button
        class="flex cursor-pointer relative"
        data-cy="data-encoder-status-configured"
        on:click={() => (showSettings = true)}
      >
        <Icon name="arrowDown" color="#bfdbfe" />
        <Icon name="arrowUp" class="absolute left-2" color="#bfdbfe" />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip right text={`Data encoder couldn't connect to the remote encoder`}>
      <button
        class="flex cursor-pointer relative"
        data-cy="data-encoder-status-error"
        on:click={() => (showSettings = true)}
      >
        <Icon name="arrowDown" color="#f87171" />
        <Icon name="arrowUp" class="absolute left-2" color="#f87171" />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip right text={'Data encoder succesfully converted content'}>
      <button
        class="flex cursor-pointer relative"
        data-cy="data-encoder-status-success"
        on:click={() => (showSettings = true)}
      >
        <Icon name="arrowDown" color="#4ade80" />
        <Icon name="arrowUp" class="absolute left-2" color="#4ade80" />
      </button>
    </Tooltip>
  {/if}
{:else}
  <Tooltip right text={'Configure data encoder'}>
    <button
      class="flex cursor-pointer relative"
      data-cy="data-encoder-status"
      on:click={() => (showSettings = true)}
    >
      <Icon name="arrowDown" color="#e4e4e7" />
      <Icon name="arrowUp" class="absolute left-2" color="#e4e4e7" />
    </button>
  </Tooltip>
{/if}
