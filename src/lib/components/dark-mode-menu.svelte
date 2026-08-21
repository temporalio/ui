<script lang="ts">
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconMoon, IconSun, IconSystemWindow } from '$lib/io/icon';
  import { useDarkModePreference } from '$lib/utilities/dark-mode';
  import {
    type DarkModePreference,
    prefersDarkMode,
  } from '$lib/utilities/dark-mode/dark-mode';

  interface Props {
    onchange?: (prefersDarkMode: boolean) => void;
  }

  const { onchange }: Props = $props();

  const setDarkModePreference = (preference: DarkModePreference) => {
    $useDarkModePreference = preference;
    onchange?.(prefersDarkMode(preference));
  };
</script>

<ToggleButtons data-testid="dark-mode-toggle-buttons" class="pl-4">
  <ToggleButton
    aria-label={translate('common.system-default')}
    data-testid="system-mode"
    onclick={() => setDarkModePreference('system')}
    active={$useDarkModePreference === 'system'}
    size="xs"
  >
    <IconSystemWindow />
  </ToggleButton>
  <ToggleButton
    aria-label={translate('common.day')}
    data-testid="day-mode"
    onclick={() => setDarkModePreference(false)}
    active={$useDarkModePreference === false}
    size="xs"
  >
    <IconSun />
  </ToggleButton>
  <ToggleButton
    aria-label={translate('common.night')}
    data-testid="night-mode"
    onclick={() => setDarkModePreference(true)}
    active={$useDarkModePreference === true}
    size="xs"
  >
    <IconMoon />
  </ToggleButton>
</ToggleButtons>
