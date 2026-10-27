<script lang="ts">
  import { Slider } from '$lib/io-poc/slider';

  let retention = $state([30]);
  let latency = $state([200, 1500]);
  let pollers = $state([8]);

  const formatDays = (days: number) => `${days} ${days === 1 ? 'day' : 'days'}`;
  const formatMilliseconds = (ms: number) =>
    ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
</script>

<div class="grid gap-10 md:grid-cols-2">
  <Slider
    label="History retention"
    helperText="Closed workflows are deleted after this period."
    bind:value={retention}
    min={1}
    max={90}
    formatValue={formatDays}
    marks={[{ value: 1 }, { value: 30 }, { value: 60 }, { value: 90 }]}
  />
  <Slider
    label="Activity latency"
    helperText="Show activities that completed within this range."
    bind:value={latency}
    min={0}
    max={5000}
    step={50}
    minStepsBetweenThumbs={2}
    formatValue={formatMilliseconds}
    thumbLabels={['Minimum latency', 'Maximum latency']}
  />
  <Slider
    label="Workflow task pollers"
    bind:value={pollers}
    min={1}
    max={16}
    error={pollers[0] > 12
      ? 'More than 12 pollers may exceed rate limits.'
      : ''}
  />
  <Slider
    label="Archival sampling rate"
    value={[100]}
    formatValue={(percent) => `${percent}%`}
    helperText="Managed by your account owner."
    disabled
  />
</div>
