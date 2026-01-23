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
    hourFormat,
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import {
    formatUTCOffset,
    type HourFormat,
    type TimestampFormat,
  } from '$lib/utilities/format-date';
  import {
    BASE_TIME_FORMAT_OPTIONS,
    getLocalTime,
    type TimeFormatOptions,
    TimezoneOptions,
    Timezones,
  } from '$lib/utilities/timezone';

  export let position: 'left' | 'right' = 'right';
  export let size: ButtonStyles['size'] = 'md';

  const open = writable(false);
  const localTime = getLocalTime();
  const QuickTimezoneOptions: TimeFormatOptions = [
    {
      label: translate('common.utc'),
      value: BASE_TIME_FORMAT_OPTIONS.UTC,
    },
    { label: translate('common.local'), value: BASE_TIME_FORMAT_OPTIONS.LOCAL },
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

  const selectTimezone = (value: string) => {
    if ($relativeTime && value !== BASE_TIME_FORMAT_OPTIONS.LOCAL)
      $relativeTime = false;
    $timeFormat = value;
    search = '';
  };

  const handleRelativeToggle = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.checked && $timeFormat !== BASE_TIME_FORMAT_OPTIONS.LOCAL) {
      $timeFormat = BASE_TIME_FORMAT_OPTIONS.LOCAL;
    }
  };

  const setTimestampFormat = (format: TimestampFormat) => {
    $timestampFormat = format;
  };

  const setHourFormat = (format: HourFormat) => {
    $hourFormat = format;
  };

  $: timezone = Timezones[$timeFormat ?? '']?.abbr ?? $timeFormat;

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
      $timeFormat = BASE_TIME_FORMAT_OPTIONS.LOCAL;
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
    {#snippet leading()}
      <Icon name="clock" />
    {/snippet}
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
      <div
        class="mx-4 mb-2 mt-4 flex gap-2 max-md:flex-col md:flex-row md:items-center md:justify-between"
      >
        <p class="font-medium">Timestamp Format</p>
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
          <ToggleButton
            size="xs"
            active={$timestampFormat === 'iso'}
            on:click={() => setTimestampFormat('iso')}>ISO</ToggleButton
          >
        </ToggleButtons>
      </div>

      <div
        class="mx-4 mb-2 flex gap-2 max-md:flex-col md:flex-row md:items-center md:justify-between"
      >
        <p class="font-medium">Hour Format</p>
        <ToggleButtons>
          <ToggleButton
            size="xs"
            active={$hourFormat === 'system'}
            disabled={$timestampFormat === 'iso'}
            on:click={() => setHourFormat('system')}>System</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={$hourFormat === '12'}
            disabled={$timestampFormat === 'iso'}
            on:click={() => setHourFormat('12')}>12-hour</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={$hourFormat === '24'}
            disabled={$timestampFormat === 'iso'}
            on:click={() => setHourFormat('24')}>24-hour</ToggleButton
          >
        </ToggleButtons>
      </div>

      <div class="mx-4 mb-4 mt-3">
        <Timestamp
          as="p"
          class="text-xs text-secondary"
          dateTime={currentDate}
        />
      </div>
    {/if}

    <MenuDivider />

    {#if !search}
      {#each QuickTimezoneOptions as { value, label }}
        <MenuItem
          onclick={() => selectTimezone(value)}
          data-testid="timezones-{value}"
          selected={value === $timeFormat}
          description={value === BASE_TIME_FORMAT_OPTIONS.LOCAL
            ? localTime
            : undefined}
        >
          {label}
        </MenuItem>
      {/each}

      <MenuDivider />
    {/if}

    {#each filteredOptions as { value, label, offset, abbr }}
      <MenuItem
        selected={value === $timeFormat}
        onclick={() => selectTimezone(value)}
        description={formatUTCOffset(offset, translate('common.utc'))}
      >
        {label} ({abbr})
      </MenuItem>
    {:else}
      <MenuItem disabled>{translate('common.no-results')}</MenuItem>
    {/each}
  </Menu>
</MenuContainer>
