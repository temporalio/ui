<script lang="ts">
  import { noop, onMount } from 'svelte/internal';

  import {
    timeFormat,
    Timezones,
    TimezoneOptions,
    relativeTime,
    type TimeFormat,
    type TimeFormatOptions,
  } from '$lib/stores/time-format';
  import { formatUTCOffset } from '$lib/utilities/format-date';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { translate } from '$lib/i18n/translate';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
    MenuDivider,
  } from '$lib/holocene/menu';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  const QuickTimezoneOptions: TimeFormatOptions = [
    {
      label: translate('utc'),
      value: 'UTC',
    },
    { label: translate('local'), value: 'local' },
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

  $: localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  $: localOption = TimezoneOptions.find(({ zones }) =>
    zones?.includes(localTimezone),
  ) ?? { label: '', abbr: '' };
  $: localDescription = `${localOption.label} (${localOption.abbr})`;

  onMount(() => {
    // Check for legacy timeFormat that may be set in localStorage
    // @ts-ignore
    if ($timeFormat === 'relative') {
      $timeFormat = 'local';
      $relativeTime = true;
    }
  });
</script>

<MenuContainer>
  <MenuButton
    label={translate('timezone', { timezone })}
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
    position="right"
    class="w-[10rem] sm:w-[20rem] md:w-[26rem]"
  >
    <Input
      label={translate('search')}
      labelHidden
      id="timezone-search"
      noBorder
      bind:value={search}
      icon="search"
      placeholder={translate('search')}
    />

    <MenuDivider />

    {#if !search}
      {#each QuickTimezoneOptions as { value, label }}
        <MenuItem
          on:click={() => selectTimezone(value)}
          data-testid={`timezones-${value}`}
          selected={value === $timeFormat}
          description={value === 'local' && localDescription}
        >
          {label}
        </MenuItem>
      {/each}

      <div class="mx-1 my-4">
        <ToggleSwitch
          label={translate('relative')}
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
        description={formatUTCOffset(offset, translate('utc'))}
      >
        {label} ({abbr})
      </MenuItem>
    {:else}
      <MenuItem disabled>{translate('no-results')}</MenuItem>
    {/each}
  </Menu>
</MenuContainer>
