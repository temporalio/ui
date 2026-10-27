<script lang="ts">
  import {
    DatePicker,
    type DateValue,
    parseDate,
  } from '$lib/io-poc/date-picker';

  let scheduleStart = $state<DateValue[]>([]);
  let startedBetween = $state<DateValue[]>([
    parseDate('2026-10-01'),
    parseDate('2026-10-27'),
  ]);
  let maintenance = $state<DateValue[]>([]);
  let archivedOn = $state<DateValue[]>([parseDate('2026-08-02')]);

  const today = parseDate(new Date());

  const isWeekend = (date: DateValue) => {
    const day = date.toDate('UTC').getUTCDay();
    return day === 0 || day === 6;
  };
</script>

<div class="grid gap-6 sm:grid-cols-2">
  <DatePicker
    label="Schedule start date"
    helperText="The first action runs on this date."
    bind:value={scheduleStart}
  />
  <DatePicker
    label="Workflow executions started between"
    selectionMode="range"
    bind:value={startedBetween}
  />
  <DatePicker
    label="Maintenance window"
    min={today}
    max={today.add({ months: 3 })}
    isDateUnavailable={isWeekend}
    helperText="Weekdays in the next three months."
    bind:value={maintenance}
  />
  <DatePicker
    label="Archived on"
    error="Archival is not enabled for this namespace."
    disabled
    bind:value={archivedOn}
  />
</div>
