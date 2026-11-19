<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { BadgeStatus, type BadgeStatusExtension } from '$lib/io/badge-status';
  import { IconCheckCircleSolid, IconXmarkCircleSolid } from '$lib/io/icon';
  import type { WorkflowStatus } from '$lib/types/workflows';

  interface Props {
    runId: string;
    duration: string;
    status: WorkflowStatus;
    open: boolean;
    live: boolean;
    stale: boolean;
  }

  let { runId, duration, status, open, live, stale }: Props = $props();

  const SUCCESS_STATUSES: WorkflowStatus[] = ['Completed', 'ContinuedAsNew'];

  const extension = $derived.by((): BadgeStatusExtension => {
    if (stale) {
      return { text: translate('workflows.stale'), colorScheme: 'warning' };
    }
    if (live) {
      return { text: translate('workflows.live'), colorScheme: 'success' };
    }
    return { text: translate('workflows.latest'), colorScheme: 'neutral' };
  });
</script>

<span class="flex min-w-0 items-center gap-2 text-xs">
  <span class="flex min-w-0 items-baseline gap-1 font-mono tabular-nums">
    <span class="truncate text-primary">{runId}</span>
    <span class="shrink-0 text-tertiary">·</span>
    <span class="shrink-0 text-secondary">{duration}</span>
  </span>
  <span
    class="ml-auto flex shrink-0 transition-opacity group-focus-within/run:opacity-0 group-hover/run:opacity-0"
  >
    {#if open}
      <BadgeStatus status="Running" size="sm" extensions={[extension]} />
    {:else if SUCCESS_STATUSES.includes(status)}
      <IconCheckCircleSolid class="text-[15px] text-static-success" />
    {:else}
      <IconXmarkCircleSolid class="text-[15px] text-static-danger" />
    {/if}
  </span>
</span>
