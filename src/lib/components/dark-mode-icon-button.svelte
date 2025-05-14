<script lang="ts">
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
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

<Tooltip bottomRight text={buttonText}>
  <IconButton
    variant="ghost"
    label={buttonText}
    icon={$useDarkMode ? 'moon' : 'sun'}
    on:click={cycleDarkModePreference}
  />
</Tooltip>
