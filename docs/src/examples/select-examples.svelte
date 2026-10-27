<script lang="ts">
  import { Select, type SelectItem } from '$lib/io-ark/select';

  const retentionPeriods: SelectItem[] = [
    { label: '1 day', value: '1', group: 'Standard' },
    { label: '7 days', value: '7', group: 'Standard' },
    { label: '30 days', value: '30', group: 'Standard' },
    { label: '60 days', value: '60', group: 'Extended' },
    { label: '90 days', value: '90', group: 'Extended', disabled: true },
  ];

  const statuses = [
    'Running',
    'Completed',
    'Failed',
    'Canceled',
    'Terminated',
    'Timed out',
  ];

  let retention = $state<string[]>(['30']);
  let statusFilter = $state<string[]>(['Running', 'Failed']);
  let region = $state<string[]>([]);
</script>

<div class="grid gap-6 rounded-lg border border-primary p-6 sm:grid-cols-2">
  <Select
    label="Retention period"
    items={retentionPeriods}
    bind:value={retention}
    helperText="Closed workflow histories are deleted after this period."
  />
  <Select
    label="Execution status"
    items={statuses}
    bind:value={statusFilter}
    multiple
    clearable
    placeholder="Any status"
  />
  <Select
    label="Archival provider"
    items={['Amazon S3', 'Google Cloud Storage']}
    value={['Amazon S3']}
    disabled
    helperText="Set by your account owner."
  />
  <Select
    label="Region"
    items={['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1']}
    bind:value={region}
    required
    error={region.length ? '' : 'Choose a region for the namespace.'}
  />
</div>
