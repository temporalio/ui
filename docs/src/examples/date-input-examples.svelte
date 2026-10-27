<script lang="ts">
  import { DateInput, type DateValue, parseDate } from '$lib/io-ark/date-input';

  let cutoff = $state<DateValue | undefined>(parseDate('2026-10-01'));
  let scheduledStart = $state<DateValue | undefined>();
  let retention = $state<DateValue | undefined>(parseDate('2026-09-15'));

  const earliest = parseDate('2026-10-01');
  const retentionError = $derived(
    retention && retention.compare(earliest) < 0
      ? 'Choose a date on or after Oct 1, 2026.'
      : '',
  );
</script>

<div class="grid gap-6 sm:grid-cols-2">
  <DateInput
    label="Show executions started after"
    helperText="Matches the StartTime search attribute."
    bind:value={cutoff}
  />
  <DateInput
    label="Scheduled start"
    granularity="minute"
    hourCycle={24}
    helperText="24-hour time in your local time zone."
    bind:value={scheduledStart}
  />
  <DateInput
    label="Retain history until"
    min={earliest}
    required
    error={retentionError}
    bind:value={retention}
  />
  <DateInput
    label="Namespace created"
    value={parseDate('2024-03-18')}
    disabled
  />
</div>
