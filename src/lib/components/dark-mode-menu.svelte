<script lang="ts">
  import Icon from '$lib/holocene/icon';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
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

<ToggleButtons class="pl-4">
  <ToggleButton
    data-testid="system-mode"
    on:click={() => setDarkModePreference('system')}
    active={$useDarkModePreference === 'system'}
    size="xs"
  >
    <Icon name="system-window" />
  </ToggleButton>
  <ToggleButton
    data-testid="day-mode"
    on:click={() => setDarkModePreference(false)}
    active={$useDarkModePreference === false}
    size="xs"
  >
    <Icon name="sun" />
  </ToggleButton>
  <ToggleButton
    data-testid="night-mode"
    on:click={() => setDarkModePreference(true)}
    active={$useDarkModePreference === true}
    size="xs"
  >
    <Icon name="moon" />
  </ToggleButton>
</ToggleButtons>
