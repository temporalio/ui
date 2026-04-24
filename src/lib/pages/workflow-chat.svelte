<script lang="ts">
  import { page } from '$app/state';

  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import type { WorkflowChatTurn } from '$lib/utilities/workflow-chat';
  import { getWorkflowChatTurns } from '$lib/utilities/workflow-chat';

  import WorkflowChatSignalForm from '../components/workflow/workflow-chat-signal-form.svelte';

  let loading = $state(true);
  let turns = $state<WorkflowChatTurn[]>([]);
  let loadId = 0;

  const workflow = $derived($workflowRun.workflow as WorkflowExecution | null);
  const namespace = $derived(page.params.namespace);
  const history = $derived($fullEventHistory as WorkflowEvents);

  const formatNumber = (value: unknown): string | null => {
    if (value == null) {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return number.toLocaleString();
  };

  const formatCost = (value: unknown): string | null => {
    if (value == null) {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return String(value);
    }

    return `$${number.toFixed(4)}`;
  };

  const loadTurns = async (events: WorkflowEvents) => {
    const currentLoadId = ++loadId;
    loading = true;

    try {
      const nextTurns = await getWorkflowChatTurns(events);

      if (currentLoadId !== loadId) {
        return;
      }

      turns = nextTurns;
    } catch (error) {
      console.error('Failed to build workflow chat transcript', error);

      if (currentLoadId !== loadId) {
        return;
      }

      turns = [];
    } finally {
      if (currentLoadId === loadId) {
        loading = false;
      }
    }
  };

  $effect(() => {
    void loadTurns(history);
  });
</script>

{#snippet CostNumbers(turn: WorkflowChatTurn)}
  {#if turn.llm.cost != null || turn.llm.totalTokens != null || turn.llm.promptTokens != null || turn.llm.completionTokens != null || turn.llm.latencyMs != null}
    <div
      class="mt-4 flex flex-wrap gap-4 border-t border-subtle pt-3 text-xs text-secondary"
    >
      {#if turn.llm.cost != null}
        <span
          >{translate('workflows.chat-cost')}: {formatCost(turn.llm.cost)}</span
        >
      {/if}
      {#if turn.llm.promptTokens != null}
        <span
          >{translate('workflows.chat-prompt-tokens')}: {formatNumber(
            turn.llm.promptTokens,
          )}</span
        >
      {/if}
      {#if turn.llm.completionTokens != null}
        <span
          >{translate('workflows.chat-completion-tokens')}: {formatNumber(
            turn.llm.completionTokens,
          )}</span
        >
      {/if}
      {#if turn.llm.totalTokens != null}
        <span
          >{translate('workflows.chat-total-tokens')}: {formatNumber(
            turn.llm.totalTokens,
          )}</span
        >
      {/if}
      {#if turn.llm.latencyMs != null}
        <span
          >{translate('workflows.chat-latency')}: {formatNumber(
            turn.llm.latencyMs,
          )} ms</span
        >
      {/if}
    </div>
  {/if}
{/snippet}

<div class="flex gap-4">
  {#if workflow}
    <WorkflowChatSignalForm {workflow} {namespace} />
  {/if}

  <div class="flex grow flex-col items-end gap-6">
    <section class="flex w-full flex-col gap-4">
      {#if loading}
        <div class="py-12 text-center">
          <Loading />
        </div>
      {:else if !turns.length}
        <EmptyState
          icon="robot"
          title={translate('workflows.chat-empty-state-title')}
          content={translate('workflows.chat-empty-state-description')}
        />
      {:else}
        <div class="flex w-full flex-col gap-6">
          {#each [...turns].reverse() as turn (turn.id)}
            <article class="flex w-full flex-col gap-3">
              <div class="flex justify-start">
                <div
                  class="surface-primary w-full rounded-2xl rounded-bl-sm border border-subtle p-2"
                >
                  <div class="flex flex-wrap items-center gap-2">
                    {#if turn.llm.provider}
                      <Badge type="default">{turn.llm.provider}</Badge>
                    {/if}
                    {#if turn.llm.model}
                      <Badge type="secondary">{turn.llm.model}</Badge>
                    {/if}
                  </div>
                  {@render CostNumbers(turn)}
                  <Markdown
                    frameId={`workflow-chat-assistant-${turn.id}`}
                    overrideTheme="primary"
                    content={turn.assistantContent}
                  />
                </div>
              </div>
              <div class="flex justify-end">
                <div
                  class="surface-primary rounded-2xl rounded-br-sm border border-subtle p-2"
                >
                  <div class="mb-2 flex items-center justify-between gap-4">
                    <p
                      class="text-xs font-medium uppercase tracking-wider text-secondary"
                    >
                      User
                    </p>
                    <p class="text-xs text-secondary">{turn.timestamp}</p>
                  </div>
                  <Markdown
                    frameId={`workflow-chat-user-${turn.id}`}
                    overrideTheme="primary"
                    content={turn.userContent}
                  />
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>
