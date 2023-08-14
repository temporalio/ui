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
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
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
    class="p-1 leading-4"
    id="timezones"
    controls="timezones-menu"
    hasIndicator
    icon="clock"
  >
    {timezone}
  </MenuButton>
  <Menu
    id="timezones-menu"
    class="w-fit max-h-96 overflow-y-scroll"
    position="right"
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

    <div class="border-b border-gray-200 -mx-2 mt-2" />

    {#if !search}
      <div class="my-4">
        <ToggleSwitch
          label={translate('relative')}
          id="relative-toggle"
          bind:checked={$relativeTime}
          labelPosition="left"
          on:change={handleRelativeToggle}
        />
      </div>

      <div class="border-b border-gray-200 -mx-2 mb-2" />

      {#each QuickTimezoneOptions as { value, label }}
        <MenuItem class="w-full" on:click={() => selectTimezone(value)}>
          <span class="w-full flex flex-row items-center gap-4 justify-between">
            <p class="truncate">{label}</p>
            {#if value === $timeFormat}
              <Icon name="checkmark" class="text-blue-700" />
            {/if}
          </span>
          {#if value === 'local'}
            <p class="text-gray-500 text-xs font-normal">
              {localDescription}
            </p>
          {/if}
        </MenuItem>
      {/each}
    {/if}

    <div class="border-b border-gray-200 -mx-2 mb-2" />

    {#each filteredOptions as { value, label, offset, abbr }}
      <MenuItem class="w-full" on:click={() => selectTimezone(value)}>
        <span class="w-full flex flex-row items-center gap-4 justify-between">
          <p class="truncate">{label} ({abbr})</p>
          {#if value === $timeFormat}
            <Icon name="checkmark" class="text-blue-700" />
          {/if}
        </span>
        <p class="text-gray-500 text-xs font-normal">
          {formatUTCOffset(offset, translate('utc'))}
        </p>
      </MenuItem>
    {:else}
      <MenuItem class="whitespace-nowrap" on:click={noop}
        >{translate('no-results')}</MenuItem
      >
    {/each}
  </Menu>
</MenuContainer>
