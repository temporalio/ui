<script lang="ts">
  import { onDestroy } from 'svelte';

  import DataEncoderSettings from '$lib/components/data-encoder-settings.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { useDarkMode } from '$lib/utilities/dark-mode';

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
  <div class="flex h-full flex-col justify-end gap-6 overflow-auto px-4 py-8">
    <TimezoneSelect position="left" />
    {#if $dataEncoder.hasError}
      <p class="text-red-400">{translate('data-encoder.codec-server-error')}</p>
    {/if}
    <NavigationButton
      onClick={onCodecServerClick}
      tooltip={translate('data-encoder.codec-server')}
      label={translate('data-encoder.codec-server')}
      icon={hasCodecServer ? 'transcoder-on' : 'transcoder-off'}
    />
    <DataEncoderSettings />
    <div class="border-b-2 border-subtle" />
    <NavigationButton
      onClick={() => ($useDarkMode = !$useDarkMode)}
      tooltip={$useDarkMode
        ? translate('common.night')
        : translate('common.day')}
      label={$useDarkMode ? translate('common.night') : translate('common.day')}
      icon={$useDarkMode ? 'moon' : 'sun'}
    />
    <slot />
  </div>
{/if}
