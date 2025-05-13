<script lang="ts">
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { useDarkMode, useDarkModePreference } from '$lib/utilities/dark-mode';

  $: darkModeText =
    $useDarkModePreference == null
      ? translate('common.system-default')
      : $useDarkModePreference
        ? translate('common.night')
        : translate('common.day');
  $: nextDarkModePreference =
    $useDarkModePreference == null
      ? true
      : $useDarkModePreference == true
        ? false
        : null;
</script>

<Tooltip bottomRight text={darkModeText}>
  <IconButton
    variant="ghost"
    label={darkModeText}
    class="relative flex items-center"
    icon={$useDarkMode ? 'moon' : 'sun'}
    on:click={() => ($useDarkModePreference = nextDarkModePreference)}
  />
</Tooltip>
