<script lang="ts">
  import { writable } from 'svelte/store';

  import { startOfDay } from 'date-fns';
  import { utcToZonedTime } from 'date-fns-tz';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { eventTimeFilter } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';
  import { updateEventFilterParams } from '$lib/utilities/event-filter-params';
  import { getSelectedTimezone } from '$lib/utilities/format-date';
  import { getTimezone } from '$lib/utilities/timezone';

  import {
    composeDate,
    endBeforeStart as endBeforeStartCalc,
    isDateAllowed as isDateAllowedCalc,
    isEndDateAllowed as isEndDateAllowedCalc,
    toStartOfDayInTz,
  } from './event-time-filter';

  type Props = {
    defaultStart: Date | null;
    defaultEnd: Date | null;
  };

  let { defaultStart, defaultEnd }: Props = $props();

  const open = writable(false);

  let innerWidth = $state(0);
  const menuPosition = $derived(innerWidth < 1134 ? 'left' : 'right');

  const timezone = $derived(getTimezone($timeFormat ?? 'UTC'));
  const selectedTime = $derived(getSelectedTimezone($timeFormat ?? 'UTC'));

  const pad = (n: number) => String(n).padStart(2, '0');
  const toZoned = (d: Date | null) => (d ? utcToZonedTime(d, timezone) : null);
  const toHour = (d: Date | null) => {
    const z = toZoned(d);
    return z ? pad(z.getHours()) : '';
  };
  const toMinute = (d: Date | null) => {
    const z = toZoned(d);
    return z ? pad(z.getMinutes()) : '';
  };
  const toSecond = (d: Date | null) => {
    const z = toZoned(d);
    return z ? pad(z.getSeconds()) : '';
  };
  const toStartOfDay = (d: Date | null) => toStartOfDayInTz(d, timezone);

  const isDateAllowed = (d: Date) =>
    isDateAllowedCalc(d, { defaultStart, defaultEnd, timezone });

  const isEndDateAllowed = $derived.by(() => {
    const bounds = { defaultStart, defaultEnd, timezone, startDate };
    return (d: Date) => isEndDateAllowedCalc(d, bounds);
  });

  let startDate = $state<Date>(toStartOfDay(null));
  let startHour = $state<string>('');
  let startMinute = $state<string>('');
  let startSecond = $state<string>('');

  let endDate = $state<Date>(toStartOfDay(null));
  let endHour = $state<string>('');
  let endMinute = $state<string>('');
  let endSecond = $state<string>('');

  let endEnabled = $state<boolean>(false);
  const filterActive = $derived(
    Boolean($eventTimeFilter.startTime || $eventTimeFilter.endTime),
  );

  const endBeforeStart = $derived(
    endBeforeStartCalc({
      endEnabled,
      startDate,
      startHour,
      startMinute,
      startSecond,
      endDate,
      endHour,
      endMinute,
      endSecond,
      timezone,
    }),
  );

  const onStartDateChange = (e: CustomEvent) => {
    startDate = startOfDay(e.detail);
    if (endDate.getTime() < startDate.getTime()) {
      endDate = startDate;
    }
  };

  const onEndDateChange = (e: CustomEvent) => {
    endDate = startOfDay(e.detail);
  };

  const hydrateFromStore = () => {
    const s = $eventTimeFilter.startTime ?? defaultStart;
    const storedEnd = $eventTimeFilter.endTime;
    const e = storedEnd ?? defaultEnd ?? new Date();
    startDate = toStartOfDay(s);
    startHour = toHour(s);
    startMinute = toMinute(s);
    startSecond = toSecond(s);
    endDate = toStartOfDay(e);
    endHour = toHour(e);
    endMinute = toMinute(e);
    endSecond = toSecond(e);
    endEnabled = storedEnd !== null;
  };

  const onToggle = (next: boolean) => {
    if (next) hydrateFromStore();
  };

  const onApply = () => {
    const start = composeDate(
      startDate,
      startHour,
      startMinute,
      startSecond,
      timezone,
    );
    let end: Date | null = null;
    if (endEnabled) {
      end = composeDate(endDate, endHour, endMinute, endSecond, timezone);
      end.setUTCMilliseconds(999);
    }
    $eventTimeFilter = { startTime: start, endTime: end };
    updateEventFilterParams(
      $page.url,
      {
        timeStart: start.toISOString(),
        timeEnd: end ? end.toISOString() : null,
      },
      goto,
    );
    $open = false;
  };

  const onClear = () => {
    $eventTimeFilter = { startTime: null, endTime: null };
    updateEventFilterParams(
      $page.url,
      { timeStart: null, timeEnd: null },
      goto,
    );
    hydrateFromStore();
  };
</script>

<svelte:window bind:innerWidth />

<MenuContainer {open}>
  <MenuButton
    controls="event-time-filter-menu"
    size="sm"
    onclick={onToggle}
    data-testid="event-time-filter"
  >
    {#snippet leading()}
      <div
        class="flex h-6 w-6 flex-col items-center justify-center rounded-full transition-colors duration-200"
        class:bg-interactive={filterActive}
      >
        <Icon name="clock" class={filterActive ? 'text-white' : ''} />
      </div>
    {/snippet}
    <span class="hidden text-sm md:block">{translate('common.time')}</span>
  </MenuButton>
  <Menu
    id="event-time-filter-menu"
    keepOpen
    position={menuPosition}
    class="max-h-fit w-[400px]"
  >
    <MenuItem>
      <div
        class="flex w-full flex-col gap-2"
        data-testid="event-time-filter-start-section"
      >
        <span class="text-xs font-medium text-secondary">
          {translate('common.start')}
        </span>
        <DatePicker
          label={translate('common.start')}
          labelHidden
          on:datechange={onStartDateChange}
          selected={startDate}
          isAllowed={isDateAllowed}
          todayLabel={translate('common.today')}
          closeLabel={translate('common.close')}
          clearLabel={translate('common.clear-input-button-label')}
        />
        <TimePicker
          bind:hour={startHour}
          bind:minute={startMinute}
          bind:second={startSecond}
          twelveHourClock={false}
        />
      </div>
    </MenuItem>
    <MenuDivider />
    <MenuItem>
      <div
        class="flex w-full flex-col gap-2"
        data-testid="event-time-filter-end-section"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-secondary">
            {translate('common.end')}
          </span>
          <ToggleSwitch
            id="event-time-filter-end-enabled"
            label={translate('common.end')}
            labelHidden
            bind:checked={endEnabled}
          />
        </div>
        <DatePicker
          label={translate('common.end')}
          labelHidden
          on:datechange={onEndDateChange}
          selected={endDate}
          isAllowed={isEndDateAllowed}
          todayLabel={translate('common.today')}
          closeLabel={translate('common.close')}
          clearLabel={translate('common.clear-input-button-label')}
          disabled={!endEnabled}
        />
        <TimePicker
          bind:hour={endHour}
          bind:minute={endMinute}
          bind:second={endSecond}
          twelveHourClock={false}
          disabled={!endEnabled}
        />
        {#if endBeforeStart}
          <p class="flex gap-1 text-xs text-danger">
            <Icon name="error" aria-hidden="true" />
            {translate('common.end-must-be-after-start')}
          </p>
        {/if}
      </div>
    </MenuItem>
    <MenuDivider />
    <p
      class="flex items-center justify-end gap-1 px-2 pt-2 text-sm text-secondary"
    >
      <Icon name="clock" aria-hidden="true" />
      {translate('common.based-on-time-preface')}
      {selectedTime}
    </p>
    <div class="flex items-center gap-2 p-2">
      <Button
        size="xs"
        variant="ghost"
        on:click={onClear}
        disabled={!filterActive}
        data-testid="event-time-filter-clear-button"
      >
        {translate('common.clear-all')}
      </Button>
      <Button
        size="xs"
        class="grow"
        on:click={onApply}
        disabled={endBeforeStart}
        data-testid="event-time-filter-apply-button"
      >
        {translate('common.apply')}
      </Button>
    </div>
  </Menu>
</MenuContainer>
