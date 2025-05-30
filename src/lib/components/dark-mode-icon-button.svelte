<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
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

<Tooltip bottomRight text={buttonText}>
  <IconButton
    variant="ghost"
    label={buttonText}
    icon={buttonIcon}
    on:click={cycleDarkModePreference}
    data-testid="dark-mode-icon-button"
  />
</Tooltip>
