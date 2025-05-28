<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    getNextDarkModePreference,
    useDarkModePreference,
  } from '$lib/utilities/dark-mode';

  let buttonText = $derived(
    $useDarkModePreference == null
      ? translate('common.system-default')
      : $useDarkModePreference
        ? translate('common.night')
        : translate('common.day'),
  );

  let buttonIcon: IconName = $derived(
    $useDarkModePreference == null
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
/>
