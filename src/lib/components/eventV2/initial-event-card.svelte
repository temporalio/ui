<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import Card from './event-summary-card/card.svelte';
  import Collapsed from './event-summary-card/collapsed.svelte';
  import Expanded from './event-summary-card/expanded.svelte';

  export let event: WorkflowEvent;
  export let events: IterableEvent[];
  export let content: string = '';
  export let showStackTrace = false;
  export let timeTravelPosition = 1;

  $: parsedContent = showStackTrace && parseWithBigInt(content);

  $: {
    if (parsedContent) {
      console.log('parsedContent: ', getStacks(parsedContent));
    }
  }

  const getSnippet = (line: number, sourceText: string): [string, number] => {
    const sliceSize = 10;
    const snippetBeginning = Math.max(0, line - Math.floor(sliceSize / 2));
    const snippetEnd = Math.min(
      sourceText.length,
      Math.max(10, line + Math.floor(sliceSize / 2)),
    );
    const sourceSlice = sourceText
      .split('\n')
      .slice(snippetBeginning, snippetEnd)
      .join('\n');
    const lineInSlice =
      line <= Math.floor(sliceSize / 2) ? line : line - snippetBeginning;
    return [sourceSlice, lineInSlice];
  };

  const getStacks = (stackTrace) => {
    const { sources, stacks } = stackTrace;
    let stackContent = [];
    Object.entries(stacks).map(([key, traces]) => {
      traces.forEach((trace) => {
        const location = trace.locations[0];
        const eventIds = trace.correlatingEventIds;
        const source = sources[location.filePath][0]?.content;
        const { line, column, functionName } = location;
        const snippet = getSnippet(line, source);
        stackContent.push({
          eventIds,
          source,
          snippet,
          line: location.line,
          column: location.column,
          functionName: location.functionName,
        });
      });
    });
    return stackContent;
  };

  $: stackTraceContent =
    parsedContent && getStacks(parsedContent)[timeTravelPosition - 1]?.snippet;
</script>

<div class="flex gap-2">
  <div class="w-[160px] min-w-[160px]" />
  <div class="flex grow flex-col overflow-auto">
    <CodeBlock
      content={showStackTrace ? stackTraceContent : content}
      title={showStackTrace ? 'Stack Trace' : 'Input'}
      language={showStackTrace ? 'text' : 'json'}
      icon="json"
      class="h-auto"
    />
  </div>
</div>
<Card {event} {events} initial let:expanded>
  <Collapsed {event} {events} {expanded} />
  {#if expanded}
    <Expanded {event} {events} />
  {/if}
</Card>
