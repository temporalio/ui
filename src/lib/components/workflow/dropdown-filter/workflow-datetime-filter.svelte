<script lang="ts">
  import {
    addHours,
    addMinutes,
    addSeconds,
    formatISO,
    startOfDay,
  } from 'date-fns';

  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { workflowFilters } from '$lib/stores/filters';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { getLocalTime } from '$lib/utilities/timezone';
  import { columnOrderedDurations } from '$lib/utilities/to-duration';

  const localTime = getLocalTime() || translate('common.local');

  let custom = false;
  let value = 'All Time';
  let timeField = 'StartTime';

  let startDate = startOfDay(new Date());
  let endDate = startOfDay(new Date());

  let startHour = '';
  let startMinute = '';
  let startSecond = '';
  let startHalf: 'AM' | 'PM' = 'AM';

  let endHour = '';
  let endMinute = '';
  let endSecond = '';
  let endHalf: 'AM' | 'PM' = 'AM';

  $: timeFilter = $workflowFilters.find(
    (f) => f.attribute === 'StartTime' || f.attribute === 'CloseTime',
  );
  $: useBetweenDateTimeQuery = custom || !$supportsAdvancedVisibility;

  const setTimeValues = () => {
    if (!timeFilter) {
      value = 'All Time';
      timeField = 'StartTime';
    } else {
      value =
        custom || !columnOrderedDurations.includes(timeFilter?.value)
          ? 'Custom'
          : timeFilter.value;
      timeField = timeFilter.attribute as string;
    }
  };

  $: timeFilter, setTimeValues();

  const getOtherFilters = () =>
    $workflowFilters.filter(
      (f) => f.attribute !== 'StartTime' && f.attribute !== 'CloseTime',
    );

  const onChange = (_value: string) => {
    value = _value;
    if (value === 'All Time') {
      $workflowFilters = [...getOtherFilters()];
      custom = false;
    } else if (value === 'Custom') {
      custom = true;
    } else {
      const filter: SearchAttributeFilter = {
        attribute: timeField,
        type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
        value,
        conditional: '>',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
      custom = false;
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters, true);
  };

  const onTimeFieldChange = (field: 'StartTime' | 'CloseTime') => {
    if (field !== timeField) {
      timeField = field;
      onChange(value);
    }
  };

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

  const setHours = (hour: string, half: 'AM' | 'PM') => {
    if (hour) {
      if (hour === '12') {
        return half === 'AM' ? '00' : '12';
      } else if (half === 'PM') {
        return (parseInt(hour) + 12).toString();
      } else {
        return hour;
      }
    } else {
      hour = '';
    }
  };

  const onApply = () => {
    let startDateWithTime = applyTimeChanges(startDate, {
      hour: setHours(startHour, startHalf),
      minute: startMinute,
      second: startSecond,
    });
    let endDateWithTime = applyTimeChanges(endDate, {
      hour: setHours(endHour, endHalf),
      minute: endMinute,
      second: endSecond,
    });

    const query = useBetweenDateTimeQuery
      ? `BETWEEN "${formatISO(startDateWithTime)}" AND "${formatISO(
          endDateWithTime,
        )}"`
      : `> "${formatISO(startDateWithTime)}"`;

    const filter: SearchAttributeFilter = {
      attribute: timeField,
      type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      value: query,
      conditional: '=',
      operator: '',
      parenthesis: '',
      customDate: true,
    };
    $workflowFilters = [...getOtherFilters(), filter];

    updateQueryParamsFromFilter($page.url, $workflowFilters, true);
  };
</script>

<div class="flex items-start">
  <MenuContainer>
    <MenuButton
      id="time-range-filter"
      hasIndicator
      controls="time-range-filter-menu"
    >
      {value}
    </MenuButton>
    <Menu
      class="w-[25rem] !overflow-visible"
      position="right"
      keepOpen
      id="time-range-filter-menu"
    >
      {#if custom}
        <div class="flex flex-col gap-2 p-2">
          <DatePicker
            label={translate('common.start')}
            on:datechange={onStartDateChange}
            selected={startDate}
            todayLabel={translate('common.today')}
            closeLabel={translate('common.close')}
            clearLabel={translate('common.clear-input-button-label')}
          />
          <TimePicker
            bind:hour={startHour}
            bind:minute={startMinute}
            bind:second={startSecond}
            bind:half={startHalf}
          />
          <DatePicker
            label={translate('common.end')}
            on:datechange={onEndDateChange}
            selected={endDate}
            todayLabel={translate('common.today')}
            closeLabel={translate('common.close')}
            clearLabel={translate('common.clear-input-button-label')}
          />
          <TimePicker
            bind:hour={endHour}
            bind:minute={endMinute}
            bind:second={endSecond}
            bind:half={endHalf}
          />
          <div class="flex gap-2">
            <Button on:click={onApply}>{translate('common.apply')}</Button>
            <Button variant="secondary" on:click={() => (custom = false)}
              >{translate('common.cancel')}</Button
            >
          </div>
        </div>
      {:else}
        <div class="flex w-full flex-wrap">
          <div class="flex w-1/2 flex-col border-b border-subtle">
            <MenuItem onclick={() => onChange('All Time')}
              >{translate('common.all-time')}</MenuItem
            >
          </div>
          <div class="flex w-1/2 flex-col border-b border-subtle">
            <MenuItem onclick={() => onChange('Custom')}
              >{translate('common.custom')}</MenuItem
            >
          </div>
          {#each columnOrderedDurations as duration}
            <div class="flex w-1/2 flex-col justify-center">
              <MenuItem onclick={() => onChange(duration)}>{duration}</MenuItem>
            </div>
          {/each}
          <div class="flex w-full flex-wrap">
            <div class="flex w-1/2 flex-col border-t border-subtle">
              <MenuItem
                selected={timeField === 'StartTime'}
                onclick={() => onTimeFieldChange('StartTime')}
              >
                {translate('common.start-time')}
              </MenuItem>
            </div>
            <div class="flex w-1/2 flex-col border-t border-subtle">
              <MenuItem
                selected={timeField === 'CloseTime'}
                onclick={() => onTimeFieldChange('CloseTime')}
              >
                {translate('common.end-time')}
              </MenuItem>
            </div>
          </div>
        </div>
      {/if}
      <MenuDivider />
      <MenuItem centered disabled>
        <Icon name="clock" aria-hidden="true" />
        {translate('common.based-on-time-preface')}
        {localTime}
      </MenuItem>
    </Menu>
  </MenuContainer>
</div>
