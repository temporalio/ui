<script>
  import NavigationButton from '$lib/holocene/navigation/navigation-button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    getNextDarkModePreference,
    useDarkMode,
    useDarkModePreference,
  } from '$lib/utilities/dark-mode';

  let buttonText = $derived(
    $useDarkModePreference == null
      ? translate('common.system-default')
      : $useDarkModePreference
        ? translate('common.night')
        : translate('common.day'),
  );

  function cycleDarkModePreference() {
    $useDarkModePreference = getNextDarkModePreference($useDarkModePreference);
  }
</script>

<NavigationButton
  onClick={cycleDarkModePreference}
  tooltip={buttonText}
  label={buttonText}
  icon={$useDarkMode ? 'moon' : 'sun'}
/>
