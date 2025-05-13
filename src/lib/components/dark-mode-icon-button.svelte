<script lang="ts">
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    getNextDarkModePreference,
    useDarkMode,
    useDarkModePreference,
  } from '$lib/utilities/dark-mode';

  $: buttonText =
    $useDarkModePreference == null
      ? translate('common.system-default')
      : $useDarkModePreference
        ? translate('common.night')
        : translate('common.day');
</script>

<Tooltip bottomRight text={buttonText}>
  <IconButton
    variant="ghost"
    label={buttonText}
    class="relative flex items-center"
    icon={$useDarkMode ? 'moon' : 'sun'}
    on:click={() =>
      ($useDarkModePreference = getNextDarkModePreference(
        $useDarkModePreference,
      ))}
  />
</Tooltip>
