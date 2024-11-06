<script lang="ts">
  import { startOfDay } from 'date-fns';
  import { onMount } from 'svelte';

  import DatePicker from '$lib/holocene/date-picker.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeInputValue } from '$lib/stores/search-attributes';
  import { getUTCString } from '$lib/utilities/format-date';

  export let value: SearchAttributeInputValue;

  let date = startOfDay(new Date());
  let hour = '';
  let minute = '';
  let second = '';

  onMount(() => {
    if (value && (typeof value === 'string' || typeof value === 'number')) {
      const datetime = new Date(value);
      const utcDate = new Date(
        datetime.getUTCFullYear(),
        datetime.getUTCMonth(),
        datetime.getUTCDate(),
      );
      date = startOfDay(utcDate);
      hour = String(datetime.getUTCHours());
      minute = String(datetime.getUTCMinutes());
      second = String(datetime.getUTCSeconds());
    } else {
      updateDatetime();
    }
  });

  const onDateChange = (d: CustomEvent) => {
    date = startOfDay(d.detail);
    updateDatetime();
  };

  const updateDatetime = () => {
    value = getUTCString({ date, hour, minute, second });
  };
</script>

<div class="flex flex-col gap-2">
  <DatePicker
    label="{translate('common.value')} ({translate('common.utc')})"
    on:datechange={onDateChange}
    selected={date}
    todayLabel={translate('common.today')}
    closeLabel={translate('common.close')}
    clearLabel={translate('common.clear-input-button-label')}
  />
  <TimePicker
    bind:hour
    bind:minute
    bind:second
    twelveHourClock={false}
    on:timechange={updateDatetime}
  />
</div>
