<script lang="ts">
  import Icon, { type IconName } from '$lib/holocene/icon';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { useDarkModePreference } from '$lib/utilities/dark-mode';
  import type { DarkModePreference } from '$lib/utilities/dark-mode/dark-mode';

  interface Props {
    position: 'left' | 'right';
  }

  const { position = 'right' }: Props = $props();

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
  };
</script>

<MenuContainer>
  <MenuButton
    controls="dark-mode-menu"
    hasIndicator
    label={menuButtonText}
    variant="ghost"
    data-testid="dark-mode-menu-button"
  >
    <Icon slot="leading" name={menuButtonIcon} aria-hidden />
  </MenuButton>
  <Menu id="dark-mode-menu" {position} class="w-max">
    <MenuItem
      on:click={() => setDarkModePreference(true)}
      selected={$useDarkModePreference === true}
    >
      <Icon slot="leading" name="moon" />
      Night
    </MenuItem>
    <MenuItem
      on:click={() => setDarkModePreference(false)}
      selected={$useDarkModePreference === false}
    >
      <Icon slot="leading" name="sun" />
      Day
    </MenuItem>
    <MenuItem
      on:click={() => setDarkModePreference('system')}
      selected={$useDarkModePreference === 'system'}
    >
      <Icon slot="leading" name="system-window" />
      System Default
    </MenuItem>
  </Menu>
</MenuContainer>
