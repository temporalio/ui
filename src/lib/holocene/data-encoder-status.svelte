<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { dataEncoder } from '$lib/stores/data-encoder';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { viewDataEncoderSettings } from './data-encoder-settings.svelte';
  import { codecEndpoint } from '$lib/stores/data-encoder-config';

  const onIconClick = () => {
    $viewDataEncoderSettings = !$viewDataEncoderSettings;
  };

  $: configuredText = $codecEndpoint
    ? 'Codec Server is configured with local override'
    : 'Codec Server is configured';
  $: errorText = $codecEndpoint
    ? 'Codec Server could not connect with local override'
    : 'Codec Server could not connect';
  $: successText = $codecEndpoint
    ? 'Codec Server succesfully converted content with local override'
    : 'Codec Server succesfully converted content';
</script>

{#if $dataEncoder?.hasEndpointOrPortConfigured}
  {#if $dataEncoder?.hasNotRequested}
    <Tooltip bottomRight text={configuredText}>
      <button
        class="relative flex items-center"
        data-testid="data-encoder-status-configured"
        on:click={onIconClick}
      >
        {#if $dataEncoder.settingsEndpointOverridden}
          <div
            class="absolute -top-3 -right-2 scale-75 rounded-full bg-orange-400"
            data-testid="data-encoder-override-icon"
          >
            <Icon name="warning" class="text-white" />
          </div>
        {/if}
        <div class="mx-1 flex items-center">
          <Icon name="transcoder-on" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip bottomRight text={errorText}>
      <button
        class="relative flex items-center"
        data-testid="data-encoder-status-error"
        on:click={onIconClick}
      >
        {#if $dataEncoder.settingsEndpointOverridden}
          <div
            class="absolute -top-3 -right-2 scale-75 rounded-full bg-orange-400"
            data-testid="data-encoder-override-icon"
          >
            <Icon name="warning" class="text-white" />
          </div>
        {/if}
        <div class="mx-1 flex items-center">
          <Icon name="transcoder-error" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip bottomRight text={successText}>
      <button
        class="relative flex items-center"
        data-testid="data-encoder-status-success"
        on:click={onIconClick}
      >
        {#if $dataEncoder.settingsEndpointOverridden}
          <div
            class="absolute -top-3 -right-2 scale-75 rounded-full bg-orange-400"
            data-testid="data-encoder-override-icon"
          >
            <Icon name="warning" class="text-white" />
          </div>
        {/if}
        <div class="mx-1 flex items-center">
          <Icon name="transcoder-on" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {/if}
{:else}
  <Tooltip bottomRight text={'Configure Codec Server'}>
    <button
      class="relative flex items-center"
      data-testid="data-encoder-status"
      on:click={onIconClick}
    >
      <div class="mx-1 flex items-center">
        <Icon name="transcoder-off" />
      </div>
      <slot />
    </button>
  </Tooltip>
{/if}
