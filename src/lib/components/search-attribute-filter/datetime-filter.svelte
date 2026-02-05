<script lang="ts">
  import { addHours, addMinutes, addSeconds, startOfDay } from 'date-fns';
  import { zonedTimeToUtc } from 'date-fns-tz';
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import {
    endDate,
    endHour,
    endMinute,
    endSecond,
    relativeTimeDuration,
    relativeTimeUnit,
    startDate,
    startHour,
    startMinute,
    startSecond,
    timeFormat,
    timeFormatType,
  } from '$lib/stores/time-format';
  import { getSelectedTimezone } from '$lib/utilities/format-date';
  import { getTimezone, TIME_UNIT_OPTIONS } from '$lib/utilities/timezone';
  import { toDate } from '$lib/utilities/to-duration';

  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  // Local state for date/time values - defaults to today
  let localStartDate = $state(startOfDay(new Date()));
  let localStartHour = $state('');
  let localStartMinute = $state('');
  let localStartSecond = $state('');

  let localEndDate = $state(startOfDay(new Date()));
  let localEndHour = $state('');
  let localEndMinute = $state('');
  let localEndSecond = $state('');

  const error = (x: string) => {
    if (x) return isNaN(Number(x)) || isNaN(parseFloat(x));
    return false;
  };

  const isTimeRange = $derived($filter.conditional === 'BETWEEN');
  const selectedTime = $derived(getSelectedTimezone($timeFormat ?? 'UTC'));

  const useBetweenDateTimeQuery = $derived(
    isTimeRange || !$supportsAdvancedVisibility,
  );
  const disabled = $derived(
    $timeFormatType === 'relative' &&
      !useBetweenDateTimeQuery &&
      (!$relativeTimeDuration || error($relativeTimeDuration)),
  );

  const onStartDateChange = (d: CustomEvent) => {
    localStartDate = startOfDay(d.detail);
  };

  const onEndDateChange = (d: CustomEvent) => {
    localEndDate = startOfDay(d.detail);
  };

  const applyTimeChanges = (
    date: Date,
    time: { hour?: string; minute?: string; second?: string },
  ) => {
    let _date = new Date(date);
    if (time.hour) _date = addHours(_date, parseInt(time.hour));
    if (time.minute) _date = addMinutes(_date, parseInt(time.minute));
    if (time.second) _date = addSeconds(_date, parseInt(time.second));

    return _date;
  };

  const onApply = () => {
    if ($timeFormatType === 'relative' && !useBetweenDateTimeQuery) {
      if (!$relativeTimeDuration) return;
      $filter.value = toDate(`${$relativeTimeDuration} ${$relativeTimeUnit}`);
      $filter.customDate = false;
    } else {
      let startDateWithTime = applyTimeChanges(localStartDate, {
        hour: localStartHour,
        minute: localStartMinute,
        second: localStartSecond,
      });
      let endDateWithTime = applyTimeChanges(localEndDate, {
        hour: localEndHour,
        minute: localEndMinute,
        second: localEndSecond,
      });

      const timezone = getTimezone($timeFormat ?? 'UTC');
      const formattedStartTime = zonedTimeToUtc(
        startDateWithTime,
        timezone,
      ).toISOString();

      const formattedEndTime = zonedTimeToUtc(
        endDateWithTime,
        timezone,
      ).toISOString();

      const value = useBetweenDateTimeQuery
        ? `BETWEEN "${formattedStartTime}" AND "${formattedEndTime}"`
        : formattedStartTime;

      $filter.value = value;

      if (isTimeRange) {
        $filter.customDate = true;
        $filter.conditional = '';
      } else {
        $filter.customDate = false;
      }

      // Update global stores so next filter gets these as defaults
      startDate.set(localStartDate);
      startHour.set(localStartHour);
      startMinute.set(localStartMinute);
      startSecond.set(localStartSecond);

      endDate.set(localEndDate);
      endHour.set(localEndHour);
      endMinute.set(localEndMinute);
      endSecond.set(localEndSecond);
    }

    handleSubmit();
  };
</script>

<ConditionalMenu
  inputId="time-range-filter"
  options={[
    { value: '<=', label: translate('common.before') },
    { value: 'BETWEEN', label: translate('common.between') },
    { value: '>=', label: translate('common.after') },
  ]}
  noBorderLeft
  noBorderRight
>
  <MenuContainer>
    <MenuButton
      id="time-range-filter"
      controls="time-range-filter-menu"
      class="whitespace-nowrap"
    >
      {translate('workflows.select-time')}
    </MenuButton>
    <Menu
      keepOpen
      id="time-range-filter-menu"
      class="max-h-fit w-[27rem] !overflow-visible"
    >
      {#if isTimeRange}
        <MenuItem>
          <div class="flex flex-col gap-2">
            <DatePicker
              label={translate('common.start')}
              on:datechange={onStartDateChange}
              selected={new Date(localStartDate)}
              todayLabel={translate('common.today')}
              closeLabel={translate('common.close')}
              clearLabel={translate('common.clear-input-button-label')}
            />
            <TimePicker
              bind:hour={localStartHour}
              bind:minute={localStartMinute}
              bind:second={localStartSecond}
              twelveHourClock={false}
            />
          </div>
        </MenuItem>
        <MenuDivider />
        <MenuItem>
          <div class="flex flex-col gap-2">
            <DatePicker
              label={translate('common.end')}
              on:datechange={onEndDateChange}
              selected={new Date(localEndDate)}
              todayLabel={translate('common.today')}
              closeLabel={translate('common.close')}
              clearLabel={translate('common.clear-input-button-label')}
            />
            <TimePicker
              bind:hour={localEndHour}
              bind:minute={localEndMinute}
              bind:second={localEndSecond}
              twelveHourClock={false}
            />
          </div>
        </MenuItem>
      {:else}
        <MenuItem onclick={() => ($timeFormatType = 'relative')}>
          <div class="flex flex-col">
            <RadioInput
              label={translate('common.relative')}
              id="relative-time"
              value="relative"
              name="time-filter-type"
              group={timeFormatType}
            />
            <div class="ml-6 flex gap-2 pt-2">
              <Input
                label={translate('common.relative')}
                labelHidden
                id="relative-datetime-input"
                bind:value={$relativeTimeDuration}
                placeholder="00"
                error={error($relativeTimeDuration)}
                class="h-10"
                disabled={$timeFormatType !== 'relative'}
              />
              <Select
                bind:value={$relativeTimeUnit}
                id="relative-datetime-unit-input"
                label={translate('common.time-unit')}
                labelHidden
                disabled={$timeFormatType !== 'relative'}
              >
                {#each TIME_UNIT_OPTIONS as unit}
                  <Option value={unit}>{unit} {translate('common.ago')}</Option>
                {/each}
              </Select>
            </div>
          </div>
        </MenuItem>
        <MenuDivider />
        <MenuItem onclick={() => ($timeFormatType = 'absolute')}>
          <div class="flex flex-col gap-2">
            <RadioInput
              label={translate('common.absolute')}
              id="absolute-time"
              value="absolute"
              name="time-filter-type"
              group={timeFormatType}
            />
            <div class="ml-6 flex flex-col gap-2">
              <DatePicker
                label={''}
                labelHidden
                on:datechange={onStartDateChange}
                selected={new Date(localStartDate)}
                todayLabel={translate('common.today')}
                closeLabel={translate('common.close')}
                clearLabel={translate('common.clear-input-button-label')}
                disabled={$timeFormatType !== 'absolute'}
              />
              <TimePicker
                bind:hour={localStartHour}
                bind:minute={localStartMinute}
                bind:second={localStartSecond}
                twelveHourClock={false}
                disabled={$timeFormatType !== 'absolute'}
              />
            </div>
          </div>
        </MenuItem>
      {/if}
      <MenuDivider />
      <div class="flex items-center p-2">
        <Button size="xs" style="width: 100%" on:click={onApply} {disabled}
          >{translate('common.apply')}</Button
        >
      </div>
      <MenuItem centered disabled class="!pt-0">
        <Icon name="clock" aria-hidden="true" />
        {translate('common.based-on-time-preface')}
        {selectedTime}
      </MenuItem>
    </Menu>
  </MenuContainer>
</ConditionalMenu>
