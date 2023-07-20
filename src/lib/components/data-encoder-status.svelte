<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { dataEncoder } from '$lib/stores/data-encoder';
  
  import { viewDataEncoderSettings } from './data-encoder-settings.svelte';
  

  const onIconClick = () => {
    $viewDataEncoderSettings = !$viewDataEncoderSettings;
    if ($viewDataEncoderSettings) {
      document.getElementById('content')?.scrollTo(0, 0);
    }
  };
</script>

{#if $dataEncoder?.hasEndpointOrPortConfigured}
  {#if $dataEncoder?.hasNotRequested}
    <Tooltip bottomRight text="Codec Server is configured">
      <button
        class="relative flex items-center"
        data-testid="data-encoder-status-configured"
        on:click={onIconClick}
      >
        <div class="mx-1 flex items-center">
          <Icon name="transcoder-on" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasError}
    <Tooltip bottomRight text="Codec Server could not connect">
      <button
        class="relative flex items-center"
        data-testid="data-encoder-status-error"
        on:click={onIconClick}
      >
        <div class="mx-1 flex items-center">
          <Icon name="transcoder-error" />
        </div>
        <slot />
      </button>
    </Tooltip>
  {:else if $dataEncoder.hasSuccess}
    <Tooltip bottomRight text="Codec Server succesfully converted content">
      <button
        class="relative flex items-center"
        data-testid="data-encoder-status-success"
        on:click={onIconClick}
      >
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
