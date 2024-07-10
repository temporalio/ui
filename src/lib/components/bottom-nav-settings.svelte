<script lang="ts">
  import DataEncoderSettings from '$lib/components/data-encoder-settings.svelte';
  import TimezoneSelect from '$lib/components/timezone-select.svelte';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { authUser } from '$lib/stores/auth-user';
  import { dataEncoder } from '$lib/stores/data-encoder';
  import { labsMode } from '$lib/stores/labs-mode';
  import { goto } from '$lib/svelte-mocks/app/navigation';
  import { useDarkMode } from '$lib/utilities/dark-mode';

  import { viewDataEncoderSettings } from './data-encoder-settings.svelte';

  export let open = false;
  export let logout: () => void;
  export let userEmaiLink = '';

  $: labsHoverText = `${translate('common.labs')} ${
    $labsMode
      ? `${translate('common.on')} - ${translate('common.experimental')}`
      : translate('common.off')
  }`;
  $: labsText = `${translate('common.labs')} ${
    $labsMode ? translate('common.on') : translate('common.off')
  }`;

  $: hasCodecServer = $dataEncoder?.endpoint;

  const onCodecServerClick = () => {
    $viewDataEncoderSettings = !$viewDataEncoderSettings;
  };
</script>

{#if open}
  <div class="flex h-full flex-col justify-start gap-4">
    <TimezoneSelect position="left" />
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
    <NavigationButton
      onClick={() => ($labsMode = !$labsMode)}
      tooltip={labsHoverText}
      label={labsText}
      icon="labs"
      active={$labsMode}
      data-testid="labs-mode-button"
    />
    {#if $authUser.accessToken}
      <div class="border-b-2 border-subtle" />
      <NavigationButton
        onClick={() => userEmaiLink && goto(userEmaiLink)}
        tooltip={$authUser.email}
        label={$authUser.email}
        data-testid="email"
      />

      <NavigationButton
        onClick={logout}
        tooltip={translate('common.log-out')}
        label={translate('common.log-out')}
        icon="exit"
        data-testid="log-out"
      />
    {/if}
  </div>
{/if}
