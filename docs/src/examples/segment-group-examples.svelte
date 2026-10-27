<script lang="ts">
  import { SegmentGroup } from '$lib/io-ark/segment-group';

  let range = $state<string | null>('24h');
  let status = $state<string | null>('all');
  let layout = $state<string | null>('list');
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <SegmentGroup
      label="Time range"
      items={[
        { value: '1h', label: '1h' },
        { value: '24h', label: '24h' },
        { value: '7d', label: '7d' },
        { value: '30d', label: '30d' },
      ]}
      bind:value={range}
    />
    <p class="text-xs text-secondary">
      Showing executions from the last {range}
    </p>
  </div>
  <SegmentGroup
    label="Workflow status"
    size="sm"
    items={[
      { value: 'all', label: 'All' },
      { value: 'running', label: 'Running' },
      { value: 'failed', label: 'Failed' },
      { value: 'terminated', label: 'Terminated', disabled: true },
    ]}
    bind:value={status}
  />
  <SegmentGroup
    label="Worker layout"
    orientation="vertical"
    items={[
      { value: 'list', label: 'List' },
      { value: 'grouped', label: 'Grouped by task queue' },
      { value: 'versions', label: 'Grouped by build ID' },
    ]}
    bind:value={layout}
  />
</div>
