<script lang="ts">
  import { noop, onMount } from 'svelte/internal';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
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
  import { formatUTCOffset } from '$lib/utilities/format-date';

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
    if (($timeFormat as string) === 'relative') {
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
    testId="timezones-menu-button"
  >
    {timezone}
  </MenuButton>
  <Menu
    id="timezones-menu"
    class="min-w-[10rem] sm:min-w-[20rem] md:min-w-[26rem] md:w-fit max-h-96 overflow-y-scroll"
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

    <div class="border-b border-gray-200 -mx-2 my-2" />

    {#if !search}
      {#each QuickTimezoneOptions as { value, label }}
        <MenuItem
          class="w-full"
          on:click={() => selectTimezone(value)}
          testId={`timezones-${value}`}
        >
          <span class="w-full flex flex-row items-center gap-4 justify-between">
            <span>
              <p class="truncate">{label}</p>
              {#if value === 'local'}
                <p class="text-gray-500 text-xs font-normal">
                  {localDescription}
                </p>
              {/if}
            </span>
            {#if value === $timeFormat}
              <Icon name="checkmark" class="text-blue-700" />
            {/if}
          </span>
        </MenuItem>
      {/each}

      <div class="my-4">
        <ToggleSwitch
          label={translate('relative')}
          id="relative-toggle"
          bind:checked={$relativeTime}
          labelPosition="left"
          on:change={handleRelativeToggle}
          data-testid="timezones-relative-toggle"
        />
      </div>

      <div class="border-b border-gray-200 -mx-2 mb-2" />
    {/if}

    {#each filteredOptions as { value, label, offset, abbr }}
      <MenuItem class="w-full" on:click={() => selectTimezone(value)}>
        <span class="w-full flex flex-row items-center gap-4 justify-between">
          <span>
            <p class="truncate">{label} ({abbr})</p>
            <p class="text-gray-500 text-xs font-normal">
              {formatUTCOffset(offset, translate('utc'))}
            </p>
          </span>
          {#if value === $timeFormat}
            <Icon name="checkmark" class="text-blue-700" />
          {/if}
        </span>
      </MenuItem>
    {:else}
      <MenuItem class="whitespace-nowrap" on:click={noop}
        >{translate('no-results')}</MenuItem
      >
    {/each}
  </Menu>
</MenuContainer>
