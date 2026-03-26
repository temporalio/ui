<script lang="ts">
  import { diffWords } from 'diff';

  import Badge from '$lib/holocene/badge.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import { fetchRawEvents } from '$lib/services/events-service';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    type CompareStepPair,
    type CompareSummary,
    computeSummary,
    extractCompareSteps,
    formatDelta,
    matchSteps,
  } from '$lib/utilities/compare-runs';

  let {
    open = $bindable(false),
    namespace,
    workflowA,
    workflowB,
  }: {
    open: boolean;
    namespace: string;
    workflowA: WorkflowExecution;
    workflowB: WorkflowExecution;
  } = $props();

  let loading = $state(true);
  let error = $state('');
  let pairs: CompareStepPair[] = $state([]);
  let summary: CompareSummary | null = $state(null);

  const loadComparison = async () => {
    loading = true;
    error = '';
    try {
      const [eventsA, eventsB] = await Promise.all([
        fetchRawEvents({
          namespace,
          workflowId: workflowA.id,
          runId: workflowA.runId,
          sort: 'ascending',
        }),
        fetchRawEvents({
          namespace,
          workflowId: workflowB.id,
          runId: workflowB.runId,
          sort: 'ascending',
        }),
      ]);

      const stepsA = extractCompareSteps(eventsA);
      const stepsB = extractCompareSteps(eventsB);
      pairs = matchSteps(stepsA, stepsB);
      summary = computeSummary(stepsA, stepsB);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load event histories';
    } finally {
      loading = false;
    }
  };

  $effect(() => {
    if (open && workflowA && workflowB) {
      loadComparison();
    }
  });

  const formatMs = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const isDifferent = (a: unknown, b: unknown): boolean => {
    return a !== undefined && b !== undefined && a !== b;
  };
</script>

<Modal
  id="compare-runs-modal"
  data-testid="compare-runs-modal"
  bind:open
  large
  hideConfirm
  confirmText=""
  cancelText="Close"
  {loading}
  {error}
  on:cancelModal={() => (open = false)}
>
  <h3 slot="title">Compare Runs</h3>
  <svelte:fragment slot="content">
    <div class="flex flex-col gap-4">
      <!-- Run identifiers -->
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded border border-subtle p-2 text-xs">
          <p class="font-medium">Run A</p>
          <p class="text-secondary">{workflowA.id}</p>
          <p class="font-mono text-secondary/60">
            {workflowA.runId.slice(0, 8)}
          </p>
        </div>
        <div class="rounded border border-subtle p-2 text-xs">
          <p class="font-medium">Run B</p>
          <p class="text-secondary">{workflowB.id}</p>
          <p class="font-mono text-secondary/60">
            {workflowB.runId.slice(0, 8)}
          </p>
        </div>
      </div>

      {#if summary}
        <!-- Summary bar -->
        <div
          class="flex items-center gap-6 rounded border border-subtle bg-interactive-table-hover p-3 text-sm"
          data-testid="compare-summary"
        >
          <div>
            <span class="text-secondary/80">Total Tokens:</span>
            <span class="font-medium"
              >{summary.totalTokensA.toLocaleString()}</span
            >
            <span class="text-secondary/60">vs</span>
            <span class="font-medium"
              >{summary.totalTokensB.toLocaleString()}</span
            >
            {#if formatDelta(summary.totalTokensA, summary.totalTokensB)}
              <span
                class={summary.totalTokensB > summary.totalTokensA
                  ? 'text-red-500'
                  : 'text-green-500'}
              >
                ({formatDelta(summary.totalTokensA, summary.totalTokensB)})
              </span>
            {/if}
          </div>
          <div>
            <span class="text-secondary/80">Duration:</span>
            <span class="font-medium">{formatMs(summary.totalDurationMsA)}</span
            >
            <span class="text-secondary/60">vs</span>
            <span class="font-medium">{formatMs(summary.totalDurationMsB)}</span
            >
          </div>
          <div>
            <span class="text-secondary/80">Steps:</span>
            <span class="font-medium">{summary.stepsA}</span>
            <span class="text-secondary/60">vs</span>
            <span class="font-medium">{summary.stepsB}</span>
          </div>
        </div>
      {/if}

      <!-- Step-by-step comparison -->
      {#if pairs.length > 0}
        <table class="w-full text-sm" data-testid="compare-steps-table">
          <thead>
            <tr
              class="border-b border-subtle text-left text-xs text-secondary/80"
            >
              <th class="px-2 py-1">Step</th>
              <th class="px-2 py-1">Run A</th>
              <th class="px-2 py-1">Run B</th>
              <th class="px-2 py-1">Delta</th>
            </tr>
          </thead>
          <tbody>
            {#each pairs as [stepA, stepB], i}
              {@const nameA = stepA?.activityName ?? ''}
              {@const nameB = stepB?.activityName ?? ''}
              <tr class="border-b border-subtle" data-testid="compare-step-row">
                <!-- Step name -->
                <td class="px-2 py-2 align-top">
                  <p class="font-medium">{nameA || nameB}</p>
                  {#if nameA && nameB && nameA !== nameB}
                    <p class="text-xs text-yellow-600">
                      Name mismatch: {nameA} / {nameB}
                    </p>
                  {/if}
                </td>

                <!-- Run A -->
                <td class="px-2 py-2 align-top">
                  {#if stepA}
                    <div class="flex flex-col gap-1">
                      {#if stepA.model}
                        <Badge type="subtle" class="w-fit">{stepA.model}</Badge>
                      {/if}
                      {#if stepA.totalTokens}
                        <p class="text-xs">
                          {stepA.totalTokens.toLocaleString()} tokens
                        </p>
                      {/if}
                      <p class="text-xs text-secondary/60">
                        {formatMs(stepA.durationMs)}
                      </p>
                      {#if stepA.output}
                        <pre
                          class="mt-1 max-h-24 overflow-auto rounded bg-code-block p-1 text-xs">{stepA.output.slice(
                            0,
                            200,
                          )}</pre>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-secondary/40">-</span>
                  {/if}
                </td>

                <!-- Run B -->
                <td class="px-2 py-2 align-top">
                  {#if stepB}
                    <div class="flex flex-col gap-1">
                      {#if stepB.model}
                        <Badge
                          type={isDifferent(stepA?.model, stepB.model)
                            ? 'warning'
                            : 'subtle'}
                          class="w-fit">{stepB.model}</Badge
                        >
                      {/if}
                      {#if stepB.totalTokens}
                        <p class="text-xs">
                          {stepB.totalTokens.toLocaleString()} tokens
                        </p>
                      {/if}
                      <p class="text-xs text-secondary/60">
                        {formatMs(stepB.durationMs)}
                      </p>
                      {#if stepB.output}
                        <pre
                          class="mt-1 max-h-24 overflow-auto rounded bg-code-block p-1 text-xs">{stepB.output.slice(
                            0,
                            200,
                          )}</pre>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-secondary/40">-</span>
                  {/if}
                </td>

                <!-- Delta -->
                <td class="px-2 py-2 align-top">
                  <div class="flex flex-col gap-1 text-xs">
                    {#if stepA?.totalTokens && stepB?.totalTokens}
                      {@const delta = formatDelta(
                        stepA.totalTokens,
                        stepB.totalTokens,
                      )}
                      {#if delta}
                        <span
                          class={stepB.totalTokens > stepA.totalTokens
                            ? 'text-red-500'
                            : 'text-green-500'}
                        >
                          {delta} tokens
                        </span>
                      {:else}
                        <span class="text-secondary/40">same</span>
                      {/if}
                    {/if}
                    {#if stepA?.durationMs && stepB?.durationMs}
                      {@const durationDelta = formatDelta(
                        stepA.durationMs,
                        stepB.durationMs,
                      )}
                      {#if durationDelta}
                        <span
                          class={stepB.durationMs > stepA.durationMs
                            ? 'text-red-500'
                            : 'text-green-500'}
                        >
                          {durationDelta}ms
                        </span>
                      {/if}
                    {/if}
                    {#if stepA?.output && stepB?.output}
                      {#if stepA.output === stepB.output}
                        <Badge type="subtle" class="w-fit text-green-600"
                          >Identical output</Badge
                        >
                      {:else}
                        <div
                          class="mt-1 max-h-32 overflow-auto rounded bg-code-block p-1.5 font-mono"
                          data-testid="output-diff"
                        >
                          {#each diffWords(stepA.output, stepB.output) as part}
                            {#if part.added}
                              <span class="bg-green-500/20 text-green-700"
                                >{part.value}</span
                              >
                            {:else if part.removed}
                              <span
                                class="bg-red-500/20 text-red-700 line-through"
                                >{part.value}</span
                              >
                            {:else}
                              <span class="text-secondary/60">{part.value}</span
                              >
                            {/if}
                          {/each}
                        </div>
                      {/if}
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else if !loading}
        <p class="py-4 text-center text-sm text-secondary">
          No activity steps found in either run.
        </p>
      {/if}
    </div>
  </svelte:fragment>
</Modal>
