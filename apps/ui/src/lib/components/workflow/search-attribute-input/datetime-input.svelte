<script lang="ts">
  import { startOfDay } from 'date-fns';
  import { onMount } from 'svelte';

  import DatePicker from '$lib/holocene/date-picker.svelte';
  import TimePicker from '$lib/holocene/time-picker.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getUTCString } from '$lib/utilities/format-date';

  export let value: string | null;

  const datetime = value ? new Date(value) : new Date();
  const utcDate = new Date(
    datetime.getUTCFullYear(),
    datetime.getUTCMonth(),
    datetime.getUTCDate(),
  );
  let date = startOfDay(utcDate);
  let hour = value ? String(datetime.getUTCHours()) : '';
  let minute = value ? String(datetime.getUTCMinutes()) : '';
  let second = value ? String(datetime.getUTCSeconds()) : '';

  onMount(() => {
    if (!value) updateDatetime();
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
