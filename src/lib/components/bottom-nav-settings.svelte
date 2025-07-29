<script lang="ts">
  import { onDestroy } from 'svelte';

  import DarkModeMenu from '$lib/components/dark-mode-menu.svelte';
  import DataEncoderSettings from '$lib/components/data-encoder-settings.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';

  import { viewDataEncoderSettings } from './data-encoder-settings.svelte';

  export let open = false;

  $: hasCodecServer = $dataEncoder?.endpoint;

  const onCodecServerClick = () => {
    $viewDataEncoderSettings = !$viewDataEncoderSettings;
  };

  onDestroy(() => {
    $viewDataEncoderSettings = false;
  });
</script>

{#if open}
  <div
    class="flex h-full flex-col justify-start gap-6 overflow-auto px-4 py-8"
    data-theme="dark"
  >
    <TimezoneSelect position="left" size="sm" />
    <DarkModeMenu position="left" size="sm" />
    <hr class="border-subtle" />
    <NavigationButton
      onClick={onCodecServerClick}
      tooltip={translate('data-encoder.codec-server')}
      label={translate('data-encoder.codec-server')}
      data-testid="data-encoder-status{hasCodecServer
        ? $dataEncoder.hasError
          ? '-error'
          : '-configured'
        : ''}"
      icon={hasCodecServer
        ? $dataEncoder.hasError
          ? 'transcoder-error'
          : 'transcoder-on'
        : 'transcoder-off'}
      class="border border-transparent pl-4"
    />
    <DataEncoderSettings />
    <slot />
  </div>
{/if}
