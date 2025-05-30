<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    getNextDarkModePreference,
    useDarkModePreference,
  } from '$lib/utilities/dark-mode';

  const buttonText = $derived(
    $useDarkModePreference == 'system'
      ? translate('common.system-default')
      : $useDarkModePreference
        ? translate('common.night')
        : translate('common.day'),
  );

  const buttonIcon: IconName = $derived(
    $useDarkModePreference == 'system'
      ? 'system-window'
      : $useDarkModePreference
        ? 'moon'
        : 'sun',
  );

  function cycleDarkModePreference() {
    $useDarkModePreference = getNextDarkModePreference($useDarkModePreference);
  }
</script>

<NavigationButton
  onClick={cycleDarkModePreference}
  tooltip={buttonText}
  label={buttonText}
  icon={buttonIcon}
  data-testid="dark-mode-navigation-button"
/>
