<script lang="ts">
  import { IconCopy, IconPause, IconRetry } from '$lib/io/icon';
  import { Button } from '$lib/io-poc/button';
  import { Tooltip } from '$lib/io-poc/tooltip';

  const runId = '5f2c9b1e-41a7-4d3b-9c2e-8a1f7d6e0b34';
</script>

<div class="flex flex-wrap items-center gap-8">
  <div class="flex items-center gap-1">
    {#each [{ label: 'Copy workflow ID', Icon: IconCopy }, { label: 'Pause schedule', Icon: IconPause }, { label: 'Retry activity', Icon: IconRetry }] as action (action.label)}
      <Tooltip content={action.label}>
        {#snippet trigger(props)}
          <Button
            {...props}
            colorScheme="ghost"
            size="sm"
            LeadingIcon={action.Icon}
            aria-label={action.label}
            tracking={false}
          />
        {/snippet}
      </Tooltip>
    {/each}
  </div>
  <div class="flex min-w-0 items-center gap-2 text-sm">
    <span class="text-secondary">Run ID</span>
    <Tooltip content={runId} placement="bottom" triggerClass="min-w-0">
      <span class="block w-32 truncate font-mono">{runId}</span>
    </Tooltip>
  </div>
</div>
