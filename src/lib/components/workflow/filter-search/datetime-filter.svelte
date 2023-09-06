<script lang="ts">
  import {
    addHours,
    addMinutes,
    addSeconds,
    formatISO,
    startOfDay,
  } from 'date-fns';
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { getLocalTime } from '$lib/utilities/format-date';
  import { toDate } from '$lib/utilities/to-duration';

  import ConditionalMenu from './conditional-menu.svelte';
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);

  const localTime = getLocalTime() || translate('local');

  $: isTimeRange = $filter.conditional === 'BETWEEN';

  let startDate = startOfDay(new Date());
  let endDate = startOfDay(new Date());

  let startHour = '';
  let startMinute = '';
  let startSecond = '';

  let endHour = '';
  let endMinute = '';
  let endSecond = '';

  const TIME_UNIT_OPTIONS = ['minutes', 'hours', 'days'];

  let timeUnit = TIME_UNIT_OPTIONS[0];
  let relativeTime = '';

  let type: 'relative' | 'absolute' = 'relative';

  $: useBetweenDateTimeQuery = isTimeRange || !$supportsAdvancedVisibility;
  $: disabled =
    type === 'relative' &&
    !useBetweenDateTimeQuery &&
    (!relativeTime || error(relativeTime));

  const onStartDateChange = (d: CustomEvent) => {
    startDate = startOfDay(d.detail);
  };

  const onEndDateChange = (d: CustomEvent) => {
    endDate = startOfDay(d.detail);
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
    if (type === 'relative' && !useBetweenDateTimeQuery) {
      if (!relativeTime) return;
      $filter.value = toDate(`${relativeTime} ${timeUnit}`);
      $filter.customDate = false;
    } else {
      let startDateWithTime = applyTimeChanges(startDate, {
        hour: startHour,
        minute: startMinute,
        second: startSecond,
      });
      let endDateWithTime = applyTimeChanges(endDate, {
        hour: endHour,
        minute: endMinute,
        second: endSecond,
      });

      const value = useBetweenDateTimeQuery
        ? `BETWEEN "${formatISO(startDateWithTime)}" AND "${formatISO(
            endDateWithTime,
          )}"`
        : formatISO(startDateWithTime);

      $filter.value = value;

      if (isTimeRange) {
        $filter.customDate = true;
        $filter.conditional = '';
      } else {
        $filter.customDate = false;
      }
    }

    handleSubmit();
  };

  const error = (x: string) => {
    if (x) return isNaN(Number(x)) || isNaN(parseFloat(x));
    return false;
  };
</script>

<div class="flex items-center">
  <ConditionalMenu
    inputId="time-range-filter"
    options={[
      { value: '<=', label: translate('before') },
      { value: 'BETWEEN', label: translate('between') },
      { value: '>=', label: translate('after') },
    ]}
  />
  <MenuContainer>
    <MenuButton
      unroundLeft
      id="time-range-filter"
      controls="time-range-filter-menu"
    >
      {translate('workflows', 'select-time')}
    </MenuButton>
    <Menu
      keepOpen
      id="time-range-filter-menu"
      class="w-[25rem] !overflow-visible"
    >
      {#if isTimeRange}
        <MenuItem>
          <div class="flex flex-col gap-2">
            <DatePicker
              label={translate('start')}
              on:datechange={onStartDateChange}
              selected={startDate}
              todayLabel={translate('today')}
              closeLabel={translate('close')}
              clearLabel={translate('clear-input-button-label')}
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
          <div class="flex flex-col gap-2">
            <DatePicker
              label={translate('end')}
              on:datechange={onEndDateChange}
              selected={endDate}
              todayLabel={translate('today')}
              closeLabel={translate('close')}
              clearLabel={translate('clear-input-button-label')}
            />
            <TimePicker
              bind:hour={endHour}
              bind:minute={endMinute}
              bind:second={endSecond}
              twelveHourClock={false}
            />
          </div>
        </MenuItem>
      {:else}
        <MenuItem on:click={() => (type = 'relative')}>
          <div class="flex flex-col">
            <label
              class="flex flex-row items-center gap-2 cursor-pointer"
              for="relative-time"
            >
              <input
                on:click|stopPropagation={() => {
                  type = 'relative';
                }}
                class="w-4 h-4 accent-gray-900"
                type="radio"
                checked={type === 'relative'}
                id="relative-time"
                tabindex="-1"
              />
              {translate('relative')}
            </label>
            <div class="ml-6 pt-2 flex gap-0">
              <Input
                label={translate('relative')}
                labelHidden
                id="relative-datetime-input"
                bind:value={relativeTime}
                placeholder="00"
                error={error(relativeTime)}
                unroundRight
                class="h-10"
              />
              <Select
                unroundLeft
                bind:value={timeUnit}
                id="relative-datetime-unit-input"
                label={translate('time-unit')}
                labelHidden
              >
                {#each TIME_UNIT_OPTIONS as unit}
                  <Option value={unit}>{unit} {translate('ago')}</Option>
                {/each}
              </Select>
            </div>
          </div>
        </MenuItem>
        <MenuDivider />
        <MenuItem on:click={() => (type = 'absolute')}>
          <div class="flex flex-col gap-2">
            <label
              class="flex flex-row items-center gap-2 cursor-pointer"
              for="absolute-time"
            >
              <input
                on:click|stopPropagation={() => (type = 'absolute')}
                class="w-4 h-4 accent-gray-900"
                type="radio"
                checked={type === 'absolute'}
                id="absolute-time"
                tabindex="-1"
              />
              {translate('absolute')}
            </label>
            <div class="flex flex-col ml-6 gap-2">
              <DatePicker
                label={''}
                labelHidden
                on:datechange={onStartDateChange}
                selected={startDate}
                todayLabel={translate('today')}
                closeLabel={translate('close')}
                clearLabel={translate('clear-input-button-label')}
              />
              <TimePicker
                bind:hour={startHour}
                bind:minute={startMinute}
                bind:second={startSecond}
                twelveHourClock={false}
              />
            </div>
          </div>
        </MenuItem>
      {/if}
      <MenuDivider />
      <div class="p-2 flex items-center">
        <Button size="xs" style="width: 100%" on:click={onApply} {disabled}
          >{translate('apply')}</Button
        >
      </div>
      <MenuItem centered disabled class="!pt-0">
        <Icon name="clock" aria-hidden="true" />
        {translate('based-on-time-preface')}
        {localTime}
      </MenuItem>
    </Menu>
  </MenuContainer>
</div>
