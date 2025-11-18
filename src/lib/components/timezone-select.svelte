<script lang="ts">
  import { type Unsubscriber, writable } from 'svelte/store';

  import { onDestroy, onMount } from 'svelte';

  import Timestamp from '$lib/components/timestamp.svelte';
  import type { ButtonStyles } from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuDivider,
    MenuItem,
  } from '$lib/holocene/menu';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    relativeTime,
    type TimeFormat,
    timeFormat,
    type TimeFormatOptions,
    timestampFormat,
    TimezoneOptions,
    Timezones,
  } from '$lib/stores/time-format';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import {
    formatUTCOffset,
    getLocalTime,
    type TimestampFormat,
  } from '$lib/utilities/format-date';

  export let position: 'left' | 'right' = 'right';
  export let size: ButtonStyles['size'] = 'md';

  const open = writable(false);
  const localTime = getLocalTime();
  const QuickTimezoneOptions: TimeFormatOptions = [
    {
      label: translate('common.utc'),
      value: 'UTC',
    },
    { label: translate('common.local'), value: 'local' },
  ];

  let search = '';
  let intervalId: number | undefined = undefined;
  let currentDate = new Date().setMilliseconds(0);
  let openUnsubscriber: Unsubscriber | undefined;

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

  const setTimestampFormat = (format: TimestampFormat) => {
    $timestampFormat = format;
  };

  $: timezone =
    Timezones[$timeFormat]?.abbr ??
    Timezones[$timeFormat]?.label ??
    capitalize($timeFormat);

  openUnsubscriber = open.subscribe((isOpen) => {
    if (isOpen) {
      currentDate = new Date().setMilliseconds(0);
      intervalId = window.setInterval(() => {
        currentDate = new Date().setMilliseconds(0);
      }, 1000);
    } else {
      window.clearInterval(intervalId);
    }
  });

  onMount(() => {
    if (String($timeFormat) === 'relative') {
      $timeFormat = 'local';
      $relativeTime = true;
    }
  });

  onDestroy(() => {
    openUnsubscriber?.();
  });
</script>

<MenuContainer {open} class="max-md:w-full max-md:justify-items-end">
  <MenuButton
    label={translate('common.timezone', { timezone })}
    controls="timezones-menu"
    hasIndicator
    variant="ghost"
    {size}
    data-testid="timezones-menu-button"
  >
    <Icon slot="leading" name="clock" />
    {timezone}
  </MenuButton>
  <Menu
    id="timezones-menu"
    {position}
    class="w-[10rem] sm:w-[20rem] md:w-[28rem]"
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

    <div class="m-4">
      <ToggleSwitch
        label={translate('common.relative')}
        id="relative-toggle"
        bind:checked={$relativeTime}
        labelPosition="left"
        on:change={handleRelativeToggle}
        data-testid="timezones-relative-toggle"
      />
    </div>

    {#if !$relativeTime}
      <div class="m-4 flex items-center justify-between gap-2">
        <div>
          <p class="font-medium">Timestamp Format</p>
          <Timestamp
            as="p"
            class="text-xs text-secondary"
            dateTime={currentDate}
          />
        </div>
        <ToggleButtons>
          <ToggleButton
            size="xs"
            active={$timestampFormat === 'short'}
            on:click={() => setTimestampFormat('short')}>Short</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={$timestampFormat === 'medium'}
            on:click={() => setTimestampFormat('medium')}>Default</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={$timestampFormat === 'long'}
            on:click={() => setTimestampFormat('long')}>Long</ToggleButton
          >
        </ToggleButtons>
      </div>
    {/if}

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
