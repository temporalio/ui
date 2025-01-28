<script lang="ts">
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';

  import { viewDataEncoderSettings } from './data-encoder-settings.svelte';

  const onIconClick = () => {
    $viewDataEncoderSettings = !$viewDataEncoderSettings;
    if ($viewDataEncoderSettings) {
      document.getElementById('content-wrapper')?.scrollTo(0, 0);
    }
  };

  let variant: 'primary' | 'ghost' = 'ghost';

  const updateVariant = (open: boolean) => {
    variant = open ? 'primary' : 'ghost';
  };

  $: updateVariant($viewDataEncoderSettings);
</script>

<div class="mx-1 flex items-center">
  {#if $dataEncoder?.endpoint}
    {#if $dataEncoder?.hasNotRequested}
      <Tooltip
        bottomRight
        text={translate('data-encoder.codec-server-configured')}
      >
        <IconButton
          {variant}
          label={translate('data-encoder.codec-server-configured')}
          class="relative flex items-center"
          data-testid="data-encoder-status-configured"
          icon="transcoder-on"
          onclick={onIconClick}
        />
      </Tooltip>
    {:else if $dataEncoder.hasError}
      <Tooltip bottomRight text={translate('data-encoder.codec-server-error')}>
        <IconButton
          {variant}
          label={translate('data-encoder.codec-server-error')}
          class="relative flex items-center"
          data-testid="data-encoder-status-error"
          icon="transcoder-error"
          onclick={onIconClick}
        />
      </Tooltip>
    {:else if $dataEncoder.hasSuccess}
      <Tooltip
        bottomRight
        text={translate('data-encoder.codec-server-success')}
      >
        <IconButton
          {variant}
          label={translate('data-encoder.codec-server-success')}
          class="relative flex items-center"
          data-testid="data-encoder-status-success"
          icon="transcoder-on"
          onclick={onIconClick}
        />
      </Tooltip>
    {/if}
  {:else}
    <Tooltip
      bottomRight
      text={translate('data-encoder.configure-codec-server')}
    >
      <IconButton
        {variant}
        label={translate('data-encoder.configure-codec-server')}
        class="relative flex items-center"
        data-testid="data-encoder-status"
        icon="transcoder-off"
        onclick={onIconClick}
      />
    </Tooltip>
  {/if}
</div>
