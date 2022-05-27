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
        class="relative flex cursor-pointer"
        data-cy="data-encoder-status-configured"
        on:click={() => (showSettings = true)}
      >
        <Icon name="arrowDown" class="-ml-1" color="#bfdbfe" />
        <Icon name="arrowUp" class="absolute left-1" color="#bfdbfe" />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip right text={`Data encoder couldn't connect to the remote encoder`}>
      <button
        class="relative flex cursor-pointer"
        data-cy="data-encoder-status-error"
        on:click={() => (showSettings = true)}
      >
        <Icon name="arrowDown" class="-ml-1" color="#f87171" />
        <Icon name="arrowUp" class="absolute left-1" color="#f87171" />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip right text={'Data encoder succesfully converted content'}>
      <button
        class="relative flex cursor-pointer"
        data-cy="data-encoder-status-success"
        on:click={() => (showSettings = true)}
      >
        <Icon name="arrowDown" class="-ml-1" color="#4ade80" />
        <Icon name="arrowUp" class="absolute left-1" color="#4ade80" />
      </button>
    </Tooltip>
  {/if}
{:else}
  <Tooltip right text={'Configure data encoder'}>
    <button
      class="relative flex cursor-pointer"
      data-cy="data-encoder-status"
      on:click={() => (showSettings = true)}
    >
      <Icon name="arrowDown" class="-ml-1" color="#e4e4e7" />
      <Icon name="arrowUp" class="absolute left-1" color="#e4e4e7" />
    </button>
  </Tooltip>
{/if}
