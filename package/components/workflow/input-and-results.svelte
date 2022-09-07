<script>var _a;
import { eventHistory, updating } from '../../stores/events';
import { getWorkflowStartedAndCompletedEvents } from '../../utilities/get-started-and-completed-events';
import { capitalize } from '../../utilities/format-camel-case';
import CodeBlock from '../../holocene/code-block.svelte';
import Loading from '$holocene/loading.svelte';
export let type;
$: title = capitalize(type);
$: content = getWorkflowStartedAndCompletedEvents((_a = $eventHistory === null || $eventHistory === void 0 ? void 0 : $eventHistory.events) !== null && _a !== void 0 ? _a : [])[type];
</script>

<article class="flex w-full flex-col lg:w-1/2" data-cy="workflow-{type}">
  <h3 class="text-lg">{title}</h3>
  {#if content}
    {#if $updating}
      <Loading title="In progress..." />
    {:else}
      <CodeBlock {content} class="mb-2 max-h-96" />
    {/if}
  {:else}
    <Loading title="In progress..." />
  {/if}
</article>
