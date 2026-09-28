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

  const THEME_BUTTON_CLASS =
    'h-[34px] w-[34px] p-2 [&:not(:last-child)]:border-r';
  const SELECTED_THEME_BUTTON_CLASS =
    'border-tertiary bg-interactive-tertiary-press text-primary hover:bg-interactive-tertiary-press active:bg-interactive-tertiary-press focus-visible:bg-interactive-tertiary-press';

  const themeButtonClass = (selected: boolean) =>
    `${THEME_BUTTON_CLASS} ${selected ? SELECTED_THEME_BUTTON_CLASS : ''}`;

  const { onchange }: Props = $props();

  const setDarkModePreference = (preference: DarkModePreference) => {
    $useDarkModePreference = preference;
    onchange?.(prefersDarkMode(preference));
  };
</script>

<ToggleButtons
  data-testid="dark-mode-toggle-buttons"
  class="pl-4 [&>button:not(:first-child)]:-ml-px"
>
  <ToggleButton
    aria-label={translate('common.system-default')}
    data-testid="system-mode"
    onclick={() => setDarkModePreference('system')}
    active={$useDarkModePreference === 'system'}
    variant="tertiary"
    size="xs"
    class={themeButtonClass($useDarkModePreference === 'system')}
  >
    <IconSystemWindow />
  </ToggleButton>
  <ToggleButton
    aria-label={translate('common.day')}
    data-testid="day-mode"
    onclick={() => setDarkModePreference(false)}
    active={$useDarkModePreference === false}
    variant="tertiary"
    size="xs"
    class={themeButtonClass($useDarkModePreference === false)}
  >
    <IconSun />
  </ToggleButton>
  <ToggleButton
    aria-label={translate('common.night')}
    data-testid="night-mode"
    onclick={() => setDarkModePreference(true)}
    active={$useDarkModePreference === true}
    variant="tertiary"
    size="xs"
    class={themeButtonClass($useDarkModePreference === true)}
  >
    <IconMoon />
  </ToggleButton>
</ToggleButtons>
