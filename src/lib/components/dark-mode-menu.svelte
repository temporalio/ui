<script lang="ts">
  import type { ButtonStyles } from '$lib/holocene/button.svelte';
  import Icon, { type IconName } from '$lib/holocene/icon';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { useDarkModePreference } from '$lib/utilities/dark-mode';
  import {
    type DarkModePreference,
    prefersDarkMode,
  } from '$lib/utilities/dark-mode/dark-mode';

  interface Props {
    position: 'left' | 'right';
    hideLabel?: boolean;
    size?: ButtonStyles['size'];
    onchange?: (prefersDarkMode: boolean) => void;
  }

  const {
    position = 'right',
    hideLabel = false,
    size = undefined,
    onchange,
  }: Props = $props();

  const menuButtonText = $derived(
    $useDarkModePreference == 'system'
      ? translate('common.system-default')
      : $useDarkModePreference
        ? translate('common.night')
        : translate('common.day'),
  );

  const menuButtonIcon: IconName = $derived(
    $useDarkModePreference == 'system'
      ? 'system-window'
      : $useDarkModePreference
        ? 'moon'
        : 'sun',
  );

  const setDarkModePreference = (preference: DarkModePreference) => {
    $useDarkModePreference = preference;
    onchange?.(prefersDarkMode(preference));
  };
</script>

<MenuContainer>
  <MenuButton
    controls="dark-mode-menu"
    hasIndicator
    label={menuButtonText}
    variant="ghost"
    data-testid="dark-mode-menu-button"
    {size}
  >
    {#if !hideLabel}{menuButtonText}{/if}
    <Icon slot="leading" name={menuButtonIcon} aria-hidden />
  </MenuButton>
  <Menu id="dark-mode-menu" {position} class="w-max">
    <MenuItem
      on:click={() => setDarkModePreference(true)}
      selected={$useDarkModePreference === true}
      data-testid="night-mode"
    >
      <Icon slot="leading" name="moon" />
      Night
    </MenuItem>
    <MenuItem
      on:click={() => setDarkModePreference(false)}
      selected={$useDarkModePreference === false}
      data-testid="day-mode"
    >
      <Icon slot="leading" name="sun" />
      Day
    </MenuItem>
    <MenuItem
      on:click={() => setDarkModePreference('system')}
      selected={$useDarkModePreference === 'system'}
      data-testid="system-mode"
    >
      <Icon slot="leading" name="system-window" />
      System Default
    </MenuItem>
  </Menu>
</MenuContainer>
