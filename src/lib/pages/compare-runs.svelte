<script lang="ts">
  import { diffWords } from 'diff';
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';

  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { fetchRawEvents } from '$lib/services/events-service';
  import {
    type CompareStep,
    type CompareStepPair,
    type CompareSummary,
    computeSummary,
    extractCompareSteps,
    formatDelta,
    matchSteps,
  } from '$lib/utilities/compare-runs';

  let {
    namespace,
    workflowIdA,
    runIdA,
    workflowIdB,
    runIdB,
  }: {
    namespace: string;
    workflowIdA: string;
    runIdA: string;
    workflowIdB: string;
    runIdB: string;
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
          workflowId: workflowIdA,
          runId: runIdA,
          sort: 'ascending',
        }),
        fetchRawEvents({
          namespace,
          workflowId: workflowIdB,
          runId: runIdB,
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

  onMount(() => {
    if (workflowIdA && workflowIdB) {
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

  const goBack = () => {
    goto(`/namespaces/${namespace}/workflows`);
  };
</script>

<div class="flex flex-col gap-4 p-4">
  <!-- Header -->
  <div class="flex items-center gap-4">
    <Button variant="ghost" on:click={goBack}>Back to Workflows</Button>
    <h1 class="text-xl font-semibold">Compare Runs</h1>
  </div>

  {#if error}
    <div
      class="rounded border border-red-500 bg-red-500/10 p-3 text-sm text-red-500"
    >
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <p class="text-sm text-secondary">Loading event histories...</p>
    </div>
  {:else}
    <!-- Run identifiers -->
    <div class="grid grid-cols-2 gap-4">
      <div class="rounded border border-subtle p-3">
        <p class="text-xs font-medium text-secondary/60">Run A</p>
        <p class="text-sm font-medium">{workflowIdA}</p>
        <p class="font-mono text-xs text-secondary/60">{runIdA.slice(0, 8)}</p>
      </div>
      <div class="rounded border border-subtle p-3">
        <p class="text-xs font-medium text-secondary/60">Run B</p>
        <p class="text-sm font-medium">{workflowIdB}</p>
        <p class="font-mono text-xs text-secondary/60">{runIdB.slice(0, 8)}</p>
      </div>
    </div>

    {#if summary}
      <!-- Summary bar -->
      <div
        class="flex flex-wrap items-center gap-6 rounded border border-subtle bg-interactive-table-hover p-4 text-sm"
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
          <span class="font-medium">{formatMs(summary.totalDurationMsA)}</span>
          <span class="text-secondary/60">vs</span>
          <span class="font-medium">{formatMs(summary.totalDurationMsB)}</span>
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
      <div class="overflow-x-auto">
        <table class="w-full text-sm" data-testid="compare-steps-table">
          <thead>
            <tr
              class="border-b border-subtle text-left text-xs text-secondary/80"
            >
              <th class="min-w-[120px] px-3 py-2">Step</th>
              <th class="min-w-[250px] px-3 py-2">Run A</th>
              <th class="min-w-[250px] px-3 py-2">Run B</th>
              <th class="min-w-[200px] px-3 py-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {#each pairs as [stepA, stepB], i}
              {@const nameA = stepA?.activityName ?? ''}
              {@const nameB = stepB?.activityName ?? ''}
              <tr class="border-b border-subtle" data-testid="compare-step-row">
                <!-- Step name -->
                <td class="px-3 py-3 align-top">
                  <p class="font-medium">{nameA || nameB}</p>
                  {#if nameA && nameB && nameA !== nameB}
                    <p class="text-xs text-yellow-600">
                      Name mismatch: {nameA} / {nameB}
                    </p>
                  {/if}
                </td>

                <!-- Run A -->
                <td class="px-3 py-3 align-top">
                  {#if stepA}
                    <div class="flex flex-col gap-1.5">
                      <div class="flex flex-wrap items-center gap-2">
                        {#if stepA.model}
                          <Badge type="subtle" class="w-fit"
                            >{stepA.model}</Badge
                          >
                        {/if}
                        {#if stepA.totalTokens}
                          <span class="text-xs text-secondary/60"
                            >{stepA.totalTokens.toLocaleString()} tokens</span
                          >
                        {/if}
                        <span class="text-xs text-secondary/40"
                          >{formatMs(stepA.durationMs)}</span
                        >
                      </div>
                      {#if stepA.output}
                        <pre
                          class="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-code-block p-2 text-xs">{stepA.output}</pre>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-secondary/40">-</span>
                  {/if}
                </td>

                <!-- Run B -->
                <td class="px-3 py-3 align-top">
                  {#if stepB}
                    <div class="flex flex-col gap-1.5">
                      <div class="flex flex-wrap items-center gap-2">
                        {#if stepB.model}
                          <Badge
                            type={isDifferent(stepA?.model, stepB.model)
                              ? 'warning'
                              : 'subtle'}
                            class="w-fit">{stepB.model}</Badge
                          >
                        {/if}
                        {#if stepB.totalTokens}
                          <span class="text-xs text-secondary/60"
                            >{stepB.totalTokens.toLocaleString()} tokens</span
                          >
                        {/if}
                        <span class="text-xs text-secondary/40"
                          >{formatMs(stepB.durationMs)}</span
                        >
                      </div>
                      {#if stepB.output}
                        <pre
                          class="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-code-block p-2 text-xs">{stepB.output}</pre>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-secondary/40">-</span>
                  {/if}
                </td>

                <!-- Delta -->
                <td class="px-3 py-3 align-top">
                  <div class="flex flex-col gap-1.5 text-xs">
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
                        <span class="text-secondary/40">same tokens</span>
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
                          class="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-code-block p-2 font-mono"
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
      </div>
    {:else}
      <p class="py-8 text-center text-sm text-secondary">
        No activity steps found in either run.
      </p>
    {/if}
  {/if}
</div>
