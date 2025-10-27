<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';

  import DarkModeMenu from '$lib/components/dark-mode-menu.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';

  import { viewDataEncoderSettings } from './data-encoder-settings.svelte';

  interface Props {
    open?: boolean;
    children?: Snippet;
  }

  let { open = false, children }: Props = $props();

  const testId = $derived.by(() => {
    const base = 'mobile-data-encoder-status';
    if ($dataEncoder?.endpoint) {
      if ($dataEncoder.hasError) {
        return `${base}-error`;
      }

      return `${base}-configured`;
    }

    return base;
  });

  const icon = $derived.by(() => {
    if ($dataEncoder?.endpoint) {
      if ($dataEncoder.hasError) {
        return 'transcoder-error';
      }

      return 'transcoder-on';
    }

    return 'transcoder-off';
  });

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
      data-testid={testId}
      class="border border-transparent pl-4"
      {icon}
    />
    {@render children?.()}
  </div>
{/if}
