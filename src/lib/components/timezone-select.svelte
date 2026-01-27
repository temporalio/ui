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
  let timezoneListElement: HTMLDivElement;

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
    $timeFormat = value;
    search = '';
    $open = false;
  };

  const setTimestampFormat = (format: TimestampFormat) => {
    $timestampFormat = format;
    $relativeTime = false;
  };

  const setHourFormat = (format: HourFormat) => {
    $hourFormat = format;
  };

  $: timezone = Timezones[$timeFormat ?? '']?.abbr ?? $timeFormat;
  $: hourFormatDisabled = $timestampFormat === 'iso' || $relativeTime;
  $: timezoneSelectionDisabled = $relativeTime || $timestampFormat === 'iso';

  openUnsubscriber = open.subscribe((isOpen) => {
    if (isOpen) {
      currentDate = new Date().setMilliseconds(0);
      intervalId = window.setInterval(() => {
        currentDate = new Date().setMilliseconds(0);
      }, 1000);

      setTimeout(() => {
        if (timezoneListElement) {
          const selectedItem = timezoneListElement.querySelector(
            '[aria-selected="true"], .selected',
          );
          if (selectedItem) {
            selectedItem.scrollIntoView({
              block: 'center',
              behavior: 'instant',
            });
          }
        }
      }, 0);
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
    keepOpen={true}
    maxHeight="max-h-[26rem]"
    class="flex w-[10rem] flex-col sm:w-[20rem] md:w-[28rem]"
  >
    <div class="mx-4 mb-2 mt-4 flex-shrink-0">
      <p class="font-medium">Timestamp Format</p>
      <Timestamp
        as="p"
        class="mb-4 text-sm text-secondary"
        dateTime={currentDate}
      />
      <div
        class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      >
        <ToggleButtons>
          <ToggleButton
            size="xs"
            active={$relativeTime}
            on:click={() => ($relativeTime = true)}
            data-testid="timezones-relative-toggle"
          >
            Relative
          </ToggleButton>
          <ToggleButton
            size="xs"
            active={!$relativeTime && $timestampFormat === 'short'}
            on:click={() => setTimestampFormat('short')}>Short</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={!$relativeTime && $timestampFormat === 'medium'}
            on:click={() => setTimestampFormat('medium')}>Default</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={!$relativeTime && $timestampFormat === 'long'}
            on:click={() => setTimestampFormat('long')}>Long</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={!$relativeTime && $timestampFormat === 'iso'}
            on:click={() => setTimestampFormat('iso')}>ISO</ToggleButton
          >
        </ToggleButtons>

        <ToggleButtons>
          <ToggleButton
            size="xs"
            active={$hourFormat === 'system'}
            disabled={hourFormatDisabled}
            on:click={() => setHourFormat('system')}
          >
            <Icon name="system-window" />
          </ToggleButton>
          <ToggleButton
            size="xs"
            active={$hourFormat === '12'}
            disabled={hourFormatDisabled}
            on:click={() => setHourFormat('12')}>12h</ToggleButton
          >
          <ToggleButton
            size="xs"
            active={$hourFormat === '24'}
            disabled={hourFormatDisabled}
            on:click={() => setHourFormat('24')}>24h</ToggleButton
          >
        </ToggleButtons>
      </div>
    </div>

    <div class="mx-4 mt-1 flex-shrink-0">
      <p class="mb-1 font-medium">Timezone</p>
    </div>

    <div class="flex-shrink-0 px-4">
      <Input
        label={translate('common.search')}
        labelHidden
        id="timezone-search"
        noBorder
        bind:value={search}
        icon="search"
        placeholder={translate('common.search')}
        disabled={timezoneSelectionDisabled}
      />
    </div>

    <MenuDivider />

    <div class="max-h-[18rem] overflow-y-auto" bind:this={timezoneListElement}>
      {#if !search}
        {#each QuickTimezoneOptions as { value, label }}
          <MenuItem
            onclick={() => selectTimezone(value)}
            data-testid="timezones-{value}"
            selected={value === $timeFormat}
            disabled={timezoneSelectionDisabled}
            description={value === BASE_TIME_FORMAT_OPTIONS.LOCAL
              ? localTime
              : undefined}
          >
            {label}
          </MenuItem>
        {/each}
      {/if}

      {#each filteredOptions as { value, label, offset, abbr }}
        <MenuItem
          selected={value === $timeFormat}
          onclick={() => selectTimezone(value)}
          disabled={timezoneSelectionDisabled}
          description={formatUTCOffset(offset, translate('common.utc'))}
        >
          {label} ({abbr})
        </MenuItem>
      {:else}
        <MenuItem disabled>{translate('common.no-results')}</MenuItem>
      {/each}
    </div>
  </Menu>
</MenuContainer>
