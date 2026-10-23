<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconAdd, IconHyphen } from '$lib/io/icon';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  import { showFullTree } from '../workflow-relationships.svelte';

  type Props = {
    workflow: WorkflowExecution;
    namespace: string;
    isRootWorkflow?: boolean;
    isActive?: boolean;
    childrenCount?: number;
    expanded?: boolean;
    indent?: number;
  };

  let {
    workflow,
    namespace,
    isRootWorkflow = false,
    isActive = false,
    childrenCount = 0,
    expanded = false,
    indent = 0,
  }: Props = $props();

  const elapsedTime = $derived(
    formatDistanceAbbreviated({
      start: workflow?.startTime,
      end: workflow?.endTime || Date.now(),
      includeMilliseconds: true,
    }),
  );

  const showExpandIcon = $derived(
    !isRootWorkflow && $showFullTree && childrenCount,
  );

  const Glyph = $derived(expanded ? IconHyphen : IconAdd);
</script>

<div
  class="flex w-full items-center justify-between gap-2 p-1 text-left text-sm lg:gap-4"
  style={`--relationship-id-width: calc(18% + ${indent * 0.18}px); --relationship-timestamps-width: calc(28% + ${indent * 0.28}px); --relationship-timestamps-width-xl: calc(42% + ${indent * 0.42}px);`}
>
  <div
    class="flex w-full flex-col gap-2 lg:min-w-0 lg:flex-row lg:items-start lg:gap-4"
  >
    <div class="flex items-center gap-2 lg:min-w-0 lg:flex-1">
      <div class="w-32 leading-4">
        <WorkflowStatusBadge status={workflow.status} />
      </div>
      <div class="w-full min-w-0 break-words leading-4">
        {#if isRootWorkflow}
          <p class="text-xs">{translate('common.type')}</p>
        {/if}
        <p>{workflow.name}</p>
      </div>
    </div>
    <div
      class="relationship-id-column min-w-0 break-words leading-4 lg:shrink-0"
    >
      {#if isRootWorkflow}
        <p class="text-xs">{translate('common.id')}</p>
      {/if}
      <Link
        href={routeForWorkflow({
          namespace,
          workflow: workflow.id,
          run: workflow.runId,
        })}
        interactive={isActive}
      >
        {workflow.id}
      </Link>
    </div>
    {#if $showFullTree}
      <div class="text-left leading-4 lg:w-20 lg:shrink-0 lg:text-right">
        {#if isRootWorkflow}
          <p class="text-xs">{translate('common.child-count')}</p>
        {/if}
        <div class="flex basis-16 items-center gap-1 leading-4 lg:justify-end">
          <span class="font-mono">{childrenCount}</span>
        </div>
      </div>
    {/if}
    <div
      class="relationship-timestamps-column hidden items-start gap-4 lg:grid lg:shrink-0"
    >
      <div class="leading-4">
        {#if isRootWorkflow}
          <p class="text-xs">{translate('common.start')}</p>
        {/if}
        <Timestamp as="p" dateTime={workflow?.startTime} />
      </div>
      <div class="leading-4">
        {#if isRootWorkflow}
          <p class="text-xs">{translate('common.end')}</p>
        {/if}
        <Timestamp as="p" dateTime={workflow?.endTime} fallback="-" />
      </div>
      <div class="leading-4">
        {#if isRootWorkflow}
          <p class="text-xs">{translate('common.duration')}</p>
        {/if}
        <p>{elapsedTime}</p>
      </div>
    </div>
  </div>
  <Glyph class={showExpandIcon ? 'shrink-0' : 'invisible shrink-0'} />
</div>

<style lang="postcss">
  @screen lg {
    .relationship-id-column {
      width: var(--relationship-id-width);
    }

    .relationship-timestamps-column {
      display: grid;
      width: var(--relationship-timestamps-width);
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 8rem;
    }
  }

  @screen xl {
    .relationship-timestamps-column {
      width: var(--relationship-timestamps-width-xl);
    }
  }

  @supports (container-type: inline-size) and (width: 1cqw) {
    @screen lg {
      .relationship-id-column {
        width: 18cqw;
      }

      .relationship-timestamps-column {
        width: 28cqw;
      }
    }

    @screen xl {
      .relationship-timestamps-column {
        width: 42cqw;
      }
    }
  }
</style>
