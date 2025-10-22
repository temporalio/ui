<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import ResetConfirmationModal from '$lib/components/workflow/client-actions/reset-confirmation-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { toaster } from '$lib/stores/toaster';
  import { workflowComparison } from '$lib/stores/workflow-comparison';
  import { refresh } from '$lib/stores/workflow-run';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowEvents } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';

  let { group, history }: { group: EventGroup; history: WorkflowEvents } =
    $props();
  const { workflow, run, namespace } = $derived(page.params);

  let showInputs = $state(false);
  let resetConfirmationModalOpen = $state(false);

  const workflowTaskStartedEventId = $derived.by(() => {
    const completedEventId = group.eventList.find(
      (event) => event.attributes.workflowTaskCompletedEventId,
    )?.attributes?.workflowTaskCompletedEventId;
    if (!completedEventId) return null;
    const workflowTaskCompletedEvent = history.find(
      (e) => e.id === completedEventId,
    );
    if (!workflowTaskCompletedEvent) return null;
    return workflowTaskCompletedEvent.attributes.startedEventId;
  });

  const onResetCompletion = async ({ runId }: { runId: string }) => {
    try {
      if (!$workflowComparison.isComparing) {
        workflowComparison.startComparison(workflow, run);
      }

      workflowComparison.addComparison(
        workflow,
        runId,
        workflowTaskStartedEventId,
      );

      const currentUrl = new URL(window.location.href);
      const compareParams = currentUrl.searchParams.getAll('compare');
      compareParams.push(runId);
      currentUrl.searchParams.delete('compare');
      compareParams.forEach((id) =>
        currentUrl.searchParams.append('compare', id),
      );

      goto(currentUrl.toString(), { replaceState: true, noScroll: true });

      toaster.push({
        variant: 'success',
        message: 'Workflow reset added to comparison',
      });
    } catch (error) {
      toaster.push({
        variant: 'error',
        message: error?.message || 'Failed to reset workflow',
      });
    }
  };
</script>

<Card class="surface-primary">
  <div class="flex items-center justify-between border-b border-subtle pb-1">
    <h3 class="text-sm">{group.displayName}</h3>
    {#if workflowTaskStartedEventId}
      <Tooltip text="Reset to this point" left>
        <Button
          variant="ghost"
          size="xs"
          on:click={() => (resetConfirmationModalOpen = true)}
        >
          <Icon name="retry" />
        </Button>
      </Tooltip>
    {/if}

    <p class="text-xs">
      {formatDate(group.eventTime, $timeFormat, {
        relative: $relativeTime,
      })}
    </p>
  </div>
  <div class="flex flex-col gap-2 pt-2">
    {#if showInputs}
      <PayloadDecoder value={group.input} key="payloads">
        {#snippet children(decodedInput)}
          <div>
            <CodeBlock
              content={decodedInput}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          </div>
        {/snippet}
      </PayloadDecoder>
    {/if}
    <PayloadDecoder value={group.result} key="payloads">
      {#snippet children(decodedResult)}
        <div>
          <CodeBlock
            content={decodedResult}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </div>
      {/snippet}
    </PayloadDecoder>
  </div>
</Card>

<ResetConfirmationModal
  {refresh}
  workflow={$workflowRun?.workflow}
  {namespace}
  presetEventId={workflowTaskStartedEventId || ''}
  {onResetCompletion}
  bind:open={resetConfirmationModalOpen}
/>
