<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { toEventHistory } from '$lib/models/event-history';
  import { getGroupLLMMetadata } from '$lib/models/event-history/get-event-llm-metadata';
  import { fetchRawEvents } from '$lib/services/events-service';
  import type { IterableEvent } from '$lib/types/events';
  import { decodePayload } from '$lib/utilities/decode-payload';

  let {
    items,
    namespace = '',
  }: { items: IterableEvent[]; namespace?: string } = $props();

  const TRUNCATE_LIMIT = 400;

  let expanded: Record<string, boolean> = $state({});
  let expandedText: Record<string, boolean> = $state({});

  const toggleExpand = (key: string, node?: TreeNode) => {
    expanded[key] = !expanded[key];
    if (
      expanded[key] &&
      node?.kind === 'child-workflow' &&
      !childNodes[key] &&
      !childLoading[key]
    ) {
      loadChildWorkflow(node);
    }
  };

  const toggleText = (key: string) => {
    expandedText[key] = !expandedText[key];
  };

  const decodeAllPayloads = (payloads: unknown): string => {
    if (
      payloads &&
      typeof payloads === 'object' &&
      'payloads' in payloads &&
      Array.isArray((payloads as Record<string, unknown>).payloads)
    ) {
      const arr = (payloads as Record<string, unknown>).payloads as unknown[];
      if (arr.length === 0) return '';
      if (arr.length === 1) {
        const decoded = decodePayload(arr[0]);
        if (typeof decoded === 'string') return decoded;
        if (decoded && typeof decoded === 'object')
          return JSON.stringify(decoded, null, 2);
        return String(decoded ?? '');
      }
      return JSON.stringify(
        arr.map((p) => decodePayload(p)),
        null,
        2,
      );
    }
    if (typeof payloads === 'string') return payloads;
    if (payloads && typeof payloads === 'object')
      return JSON.stringify(payloads, null, 2);
    return String(payloads ?? '');
  };

  type DecodedResult = {
    llmBlock: Record<string, unknown> | null;
    otherFields: Record<string, unknown> | null;
  };

  const decodeResultPayload = (result: unknown): DecodedResult => {
    let decoded: unknown = result;
    if (
      result &&
      typeof result === 'object' &&
      'payloads' in result &&
      Array.isArray((result as Record<string, unknown>).payloads)
    ) {
      decoded = decodePayload((result as Record<string, unknown>).payloads[0]);
    }
    if (decoded && typeof decoded === 'object') {
      const obj = decoded as Record<string, unknown>;
      if (obj._details && typeof obj._details === 'object') {
        const llmData = obj._details as Record<string, unknown>;
        const llmBlock: Record<string, unknown> = {};
        if ('result' in obj) llmBlock.result = obj.result;
        Object.assign(llmBlock, llmData);
        const other: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (k !== '_details' && k !== 'result') other[k] = v;
        }
        return {
          llmBlock,
          otherFields: Object.keys(other).length > 0 ? other : null,
        };
      }
      return { llmBlock: null, otherFields: obj };
    }
    if (decoded)
      return { llmBlock: null, otherFields: { result: String(decoded) } };
    return { llmBlock: null, otherFields: null };
  };

  type TreeNode = {
    key: string;
    name: string;
    kind: 'activity' | 'child-workflow' | 'other';
    isLLM: boolean;
    durationMs: number;
    input: string;
    llmBlock: Record<string, unknown> | null;
    otherFields: Record<string, unknown> | null;
    childWorkflowId?: string;
    childRunId?: string;
  };

  // Lazy-loaded child workflow nodes
  let childNodes: Record<string, TreeNode[]> = $state({});
  let childLoading: Record<string, boolean> = $state({});

  const loadChildWorkflow = async (node: TreeNode) => {
    if (!node.childWorkflowId || !node.childRunId || !namespace) return;
    childLoading[node.key] = true;
    try {
      const rawEvents = await fetchRawEvents({
        namespace,
        workflowId: node.childWorkflowId,
        runId: node.childRunId,
        sort: 'ascending',
      });
      const events = toEventHistory(rawEvents);
      const groups = groupEvents(events).filter(
        (g) =>
          g.category === 'activity' ||
          g.category === 'local-activity' ||
          g.category === 'child-workflow',
      );
      childNodes[node.key] = groups.map((g, i) =>
        buildNode(g, i, `${node.key}-`),
      );
    } catch {
      childNodes[node.key] = [];
    } finally {
      childLoading[node.key] = false;
    }
  };

  const buildNode = (group: EventGroup, idx: number, prefix = ''): TreeNode => {
    const llmMetadata = getGroupLLMMetadata(group);
    const name = group.displayName || group.name || group.label;
    const category = group.category;

    let kind: TreeNode['kind'] = 'other';
    if (category === 'activity' || category === 'local-activity')
      kind = 'activity';
    else if (category === 'child-workflow') kind = 'child-workflow';

    const firstEvent = group.initialEvent;
    const lastEvent = group.lastEvent;
    const startTime = firstEvent?.eventTime || firstEvent?.timestamp || '';
    const endTime = lastEvent?.eventTime || lastEvent?.timestamp || '';
    const durationMs =
      startTime && endTime
        ? new Date(endTime).getTime() - new Date(startTime).getTime()
        : 0;

    const scheduledEvent = group.eventList.find(
      (e) =>
        e.eventType === 'ActivityTaskScheduled' ||
        e.eventType === 'StartChildWorkflowExecutionInitiated',
    );
    const completedEvent = group.eventList.find(
      (e) =>
        e.eventType === 'ActivityTaskCompleted' ||
        e.eventType === 'ChildWorkflowExecutionCompleted',
    );

    const input = scheduledEvent?.attributes?.input
      ? decodeAllPayloads(scheduledEvent.attributes.input)
      : '';
    const { llmBlock, otherFields } = completedEvent?.attributes?.result
      ? decodeResultPayload(completedEvent.attributes.result)
      : { llmBlock: null, otherFields: null };

    // Extract child workflow execution info
    let childWorkflowId: string | undefined;
    let childRunId: string | undefined;
    if (kind === 'child-workflow') {
      const startedEvent = group.eventList.find(
        (e) => e.eventType === 'ChildWorkflowExecutionStarted',
      );
      const attrs = startedEvent?.attributes as
        | Record<string, unknown>
        | undefined;
      const exec = attrs?.workflowExecution as
        | Record<string, string>
        | undefined;
      childWorkflowId = exec?.workflowId;
      childRunId = exec?.runId;
    }

    return {
      key: `${prefix}node-${idx}`,
      name,
      kind,
      isLLM: !!llmMetadata,
      durationMs,
      input,
      llmBlock,
      otherFields,
      childWorkflowId,
      childRunId,
    };
  };

  const nodes = $derived(
    items
      .filter(isEventGroup)
      .filter((g) => {
        const group = g as EventGroup;
        return (
          group.category === 'activity' ||
          group.category === 'local-activity' ||
          group.category === 'child-workflow'
        );
      })
      .map((g, i) => buildNode(g as EventGroup, i)),
  );

  const formatMs = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60_000).toFixed(1)}m`;
  };
</script>

<div class="p-4 font-mono text-sm" data-testid="tree-view">
  {#if nodes.length === 0}
    <p class="py-8 text-center text-sm text-secondary">
      No activity steps found.
    </p>
  {:else}
    {#each nodes as node, idx}
      {@const isLast = idx === nodes.length - 1}
      {@const treeChar = isLast ? '└' : '├'}
      {@const isOpen = expanded[node.key]}

      <div class="flex flex-col">
        <button
          class="flex w-full cursor-pointer select-none items-center gap-1 rounded py-1 pl-2 pr-2 text-left hover:bg-interactive-table-hover"
          onclick={() => toggleExpand(node.key, node)}
        >
          <span class="w-5 text-center text-secondary/20">{treeChar}─</span>

          {#if node.kind === 'child-workflow'}
            <svg
              class="h-3.5 w-3.5 text-information"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              ><path
                d="M2 3.5A1.5 1.5 0 013.5 2h2.379a1.5 1.5 0 011.06.44l.622.62a1.5 1.5 0 001.06.44H12.5A1.5 1.5 0 0114 5v7.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9z"
              />{#if isOpen}<path
                  d="M5 8h6"
                  stroke-linecap="round"
                />{:else}<path
                  d="M8 5.5v5M5.5 8h5"
                  stroke-linecap="round"
                />{/if}</svg
            >
          {:else if node.isLLM}
            <svg
              class="h-3.5 w-3.5 text-green-500"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              ><circle cx="8" cy="8" r="3" /><path
                d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12"
                stroke-linecap="round"
              /></svg
            >
          {:else}
            <svg
              class="h-3.5 w-3.5 text-secondary/40"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              ><circle cx="8" cy="8" r="2.5" /><path
                d="M8 2v2.5M8 11.5V14"
                stroke-linecap="round"
              /></svg
            >
          {/if}

          <span class="font-medium">{node.name}</span>

          {#if node.isLLM}<Badge type="subtle" class="ml-1 text-[10px]"
              >_details</Badge
            >{/if}
          {#if node.kind === 'child-workflow'}<Badge
              type="primary"
              class="ml-1 text-[10px]">child workflow</Badge
            >{/if}
          {#if node.durationMs > 0}<span
              class="ml-auto text-xs text-secondary/30"
              >{formatMs(node.durationMs)}</span
            >{/if}
        </button>

        {#if isOpen}
          <div
            class="mb-2 ml-[52px] flex flex-col gap-2 border-l border-secondary/10 pl-4"
          >
            {#if node.input}
              <div>
                <p
                  class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                >
                  Input
                </p>
                <div
                  class="bg-surface-primary mt-1 rounded border border-subtle px-3 py-2"
                >
                  {#if node.input.length > TRUNCATE_LIMIT && !expandedText[`${node.key}-in`]}
                    <pre
                      class="whitespace-pre-wrap break-words text-xs">{node.input.slice(
                        0,
                        TRUNCATE_LIMIT,
                      )}...</pre>
                    <button
                      class="mt-1 text-xs text-information hover:underline"
                      onclick={() => toggleText(`${node.key}-in`)}
                      >Show more</button
                    >
                  {:else}
                    <pre
                      class="whitespace-pre-wrap break-words text-xs">{node.input}</pre>
                    {#if node.input.length > TRUNCATE_LIMIT}
                      <button
                        class="mt-1 text-xs text-information hover:underline"
                        onclick={() => toggleText(`${node.key}-in`)}
                        >Show less</button
                      >
                    {/if}
                  {/if}
                </div>
              </div>
            {/if}

            {#if node.llmBlock}
              {@const resultText = node.llmBlock.result
                ? String(node.llmBlock.result)
                : ''}
              {@const meta = Object.fromEntries(
                Object.entries(node.llmBlock).filter(([k]) => k !== 'result'),
              )}
              {@const hasMeta = Object.keys(meta).length > 0}
              <div>
                <p
                  class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                >
                  _details
                </p>
                <div
                  class="mt-1 rounded bg-interactive-secondary-active px-3 py-2"
                >
                  {#if resultText}
                    {#if resultText.length > TRUNCATE_LIMIT && !expandedText[`${node.key}-llm`]}
                      <pre
                        class="whitespace-pre-wrap break-words text-xs">{resultText.slice(
                          0,
                          TRUNCATE_LIMIT,
                        )}...</pre>
                      <button
                        class="mt-1 text-xs text-information hover:underline"
                        onclick={() => toggleText(`${node.key}-llm`)}
                        >Show more</button
                      >
                    {:else}
                      <pre
                        class="whitespace-pre-wrap break-words text-xs">{resultText}</pre>
                      {#if resultText.length > TRUNCATE_LIMIT}
                        <button
                          class="mt-1 text-xs text-information hover:underline"
                          onclick={() => toggleText(`${node.key}-llm`)}
                          >Show less</button
                        >
                      {/if}
                    {/if}
                  {/if}
                  {#if hasMeta}
                    <div
                      class="mt-2 flex flex-wrap gap-3 border-t border-white/10 pt-2"
                    >
                      {#each Object.entries(meta) as [k, v]}
                        <span class="text-[10px]"
                          ><span class="text-secondary/40">{k}</span>
                          <span class="font-medium text-secondary/70">{v}</span
                          ></span
                        >
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            {/if}

            {#if node.otherFields}
              <div>
                <p
                  class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                >
                  Output
                </p>
                <div
                  class="mt-1 rounded border border-subtle bg-code-block px-3 py-2"
                >
                  <pre
                    class="whitespace-pre-wrap break-words text-xs text-secondary/70">{JSON.stringify(
                      node.otherFields,
                      null,
                      2,
                    )}</pre>
                </div>
              </div>
            {/if}

            <!-- Child workflow sub-tree -->
            {#if node.kind === 'child-workflow'}
              {#if childLoading[node.key]}
                <p class="text-xs text-secondary/40">
                  Loading child workflow...
                </p>
              {:else if childNodes[node.key]}
                {#each childNodes[node.key] as child, childIdx}
                  {@const childIsLast =
                    childIdx === childNodes[node.key].length - 1}
                  {@const childTreeChar = childIsLast ? '└' : '├'}
                  <div class="flex flex-col">
                    <button
                      class="flex w-full cursor-pointer select-none items-center gap-1 rounded py-1 text-left hover:bg-interactive-table-hover"
                      onclick={() => toggleExpand(child.key, child)}
                    >
                      <span class="w-5 text-center text-secondary/20"
                        >{childTreeChar}─</span
                      >
                      {#if child.kind === 'child-workflow'}
                        <svg
                          class="h-3.5 w-3.5 text-information"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          ><path
                            d="M2 3.5A1.5 1.5 0 013.5 2h2.379a1.5 1.5 0 011.06.44l.622.62a1.5 1.5 0 001.06.44H12.5A1.5 1.5 0 0114 5v7.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9z"
                          /></svg
                        >
                      {:else if child.isLLM}
                        <svg
                          class="h-3.5 w-3.5 text-green-500"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          ><circle cx="8" cy="8" r="3" /><path
                            d="M8 1v3M8 12v3M1 8h3M12 8h3M3.05 3.05l2.12 2.12M10.83 10.83l2.12 2.12M3.05 12.95l2.12-2.12M10.83 5.17l2.12-2.12"
                            stroke-linecap="round"
                          /></svg
                        >
                      {:else}
                        <svg
                          class="h-3.5 w-3.5 text-secondary/40"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          ><circle cx="8" cy="8" r="2.5" /><path
                            d="M8 2v2.5M8 11.5V14"
                            stroke-linecap="round"
                          /></svg
                        >
                      {/if}
                      <span class="font-medium">{child.name}</span>
                      {#if child.isLLM}<Badge
                          type="subtle"
                          class="ml-1 text-[10px]">_details</Badge
                        >{/if}
                      {#if child.kind === 'child-workflow'}<Badge
                          type="primary"
                          class="ml-1 text-[10px]">child workflow</Badge
                        >{/if}
                      {#if child.durationMs > 0}<span
                          class="ml-auto text-xs text-secondary/30"
                          >{formatMs(child.durationMs)}</span
                        >{/if}
                    </button>

                    {#if expanded[child.key]}
                      <div
                        class="mb-2 ml-6 flex flex-col gap-2 border-l border-secondary/10 pl-4"
                      >
                        {#if child.input}
                          <div>
                            <p
                              class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                            >
                              Input
                            </p>
                            <div
                              class="bg-surface-primary mt-1 rounded border border-subtle px-3 py-2"
                            >
                              <pre
                                class="whitespace-pre-wrap break-words text-xs">{child.input}</pre>
                            </div>
                          </div>
                        {/if}
                        {#if child.llmBlock}
                          {@const cResultText = child.llmBlock.result
                            ? String(child.llmBlock.result)
                            : ''}
                          {@const cMeta = Object.fromEntries(
                            Object.entries(child.llmBlock).filter(
                              ([k]) => k !== 'result',
                            ),
                          )}
                          <div>
                            <p
                              class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                            >
                              _details
                            </p>
                            <div
                              class="mt-1 rounded bg-interactive-secondary-active px-3 py-2"
                            >
                              {#if cResultText}<pre
                                  class="whitespace-pre-wrap break-words text-xs">{cResultText}</pre>{/if}
                              {#if Object.keys(cMeta).length > 0}
                                <div
                                  class="mt-2 flex flex-wrap gap-3 border-t border-white/10 pt-2"
                                >
                                  {#each Object.entries(cMeta) as [k, v]}
                                    <span class="text-[10px]"
                                      ><span class="text-secondary/40">{k}</span
                                      >
                                      <span
                                        class="font-medium text-secondary/70"
                                        >{v}</span
                                      ></span
                                    >
                                  {/each}
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/if}
                        {#if child.otherFields}
                          <div>
                            <p
                              class="text-[10px] font-medium uppercase tracking-wider text-secondary/40"
                            >
                              Output
                            </p>
                            <div
                              class="mt-1 rounded border border-subtle bg-code-block px-3 py-2"
                            >
                              <pre
                                class="whitespace-pre-wrap break-words text-xs text-secondary/70">{JSON.stringify(
                                  child.otherFields,
                                  null,
                                  2,
                                )}</pre>
                            </div>
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {/each}
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
