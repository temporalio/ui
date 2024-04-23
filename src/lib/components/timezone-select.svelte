<script lang="ts">
  import { onMount } from 'svelte/internal';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuDivider,
    MenuItem,
  } from '$lib/holocene/menu';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    relativeTime,
    type TimeFormat,
    timeFormat,
    type TimeFormatOptions,
    TimezoneOptions,
    Timezones,
  } from '$lib/stores/time-format';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { formatUTCOffset, getLocalTime } from '$lib/utilities/format-date';

  export let position: 'left' | 'right' = 'right';

  const localTime = getLocalTime();
  const QuickTimezoneOptions: TimeFormatOptions = [
    {
      label: translate('common.utc'),
      value: 'UTC',
    },
    { label: translate('common.local'), value: 'local' },
  ];

  let search = '';

  $: filteredOptions = !search
    ? TimezoneOptions
    : TimezoneOptions.filter(({ abbr, value, zones }) => {
        const searchValue = search.trim().toLowerCase();
        return (
          value.toLowerCase().includes(searchValue) ||
          abbr?.toLowerCase().includes(searchValue) ||
          zones?.some((zone) => zone.toLowerCase().includes(searchValue))
        );
      });

  const selectTimezone = (value: TimeFormat) => {
    if ($relativeTime && value !== 'local') $relativeTime = false;
    $timeFormat = value;
    search = '';
  };

  const handleRelativeToggle = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.checked && $timeFormat !== 'local') {
      $timeFormat = 'local';
    }
  };

  $: timezone =
    Timezones[$timeFormat]?.abbr ??
    Timezones[$timeFormat]?.label ??
    capitalize($timeFormat);

  onMount(() => {
    if (String($timeFormat) === 'relative') {
      $timeFormat = 'local';
      $relativeTime = true;
    }
  });
</script>

<MenuContainer>
  <MenuButton
    label={translate('common.timezone', { timezone })}
    controls="timezones-menu"
    hasIndicator
    variant="ghost"
    data-testid="timezones-menu-button"
  >
    <Icon slot="leading" name="clock" />
    {timezone}
  </MenuButton>
  <Menu
    id="timezones-menu"
    {position}
    class="w-[10rem] sm:w-[20rem] md:w-[26rem]"
  >
    <Input
      label={translate('common.search')}
      labelHidden
      id="timezone-search"
      noBorder
      bind:value={search}
      icon="search"
      placeholder={translate('common.search')}
    />

    <MenuDivider />

    {#if !search}
      {#each QuickTimezoneOptions as { value, label }}
        <MenuItem
          on:click={() => selectTimezone(value)}
          data-testid={`timezones-${value}`}
          selected={value === $timeFormat}
          description={value === 'local' && localTime}
        >
          {label}
        </MenuItem>
      {/each}

      <div class="mx-2 my-4">
        <ToggleSwitch
          label={translate('common.relative')}
          id="relative-toggle"
          bind:checked={$relativeTime}
          labelPosition="left"
          on:change={handleRelativeToggle}
          data-testid="timezones-relative-toggle"
        />
      </div>

      <MenuDivider />
    {/if}

    {#each filteredOptions as { value, label, offset, abbr }}
      <MenuItem
        selected={value === $timeFormat}
        on:click={() => selectTimezone(value)}
        description={formatUTCOffset(offset, translate('common.utc'))}
      >
        {label} ({abbr})
      </MenuItem>
    {:else}
      <MenuItem disabled>{translate('common.no-results')}</MenuItem>
    {/each}
  </Menu>
</MenuContainer>
