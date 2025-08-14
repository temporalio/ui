<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { format } from '$lib/utilities/format-camel-case';
  import {
    type CombinedAttributes,
    formatAttributes,
  } from '$lib/utilities/format-event-attributes';
  import {
    getCodeBlockValue,
    getStackTrace,
  } from '$lib/utilities/get-single-attribute-for-event';

  import BoxAnimation from './box-animation.svelte';

  let {
    workflow,
    history,
  }: { workflow: WorkflowExecution; history: WorkflowEvent[] } = $props();

  const pendingActivities = $derived(workflow?.pendingActivities || []);
  const pendingNexusOperations = $derived(
    workflow?.pendingNexusOperations || [],
  );
  const groups = $derived(
    groupEvents(
      history,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );

  let activeGroup: EventGroup | undefined = $state(undefined);
  let input: CombinedAttributes | undefined = $state(undefined);
  let result: CombinedAttributes | undefined = $state(undefined);
  const inputFields = $derived(input ? Object.entries(input) : []);
  const resultFields = $derived(result ? Object.entries(result) : []);

  const inputPayloads = $derived(
    inputFields.filter(
      ([_key, value]) =>
        typeof value === 'object' && Object.keys(value).length > 0,
    ) || [],
  );

  const resultPayloads = $derived(
    resultFields.filter(
      ([_key, value]) =>
        typeof value === 'object' && Object.keys(value).length > 0,
    ) || [],
  );

  const clearGroupInputResult = () => {
    activeGroup = undefined;
    input = undefined;
    result = undefined;
  };

  const setGroupInputResult = (group: EventGroup) => {
    activeGroup = group;

    if (group?.initialEvent) input = formatAttributes(group.initialEvent);
    if (group?.lastEvent && group.eventList.length > 1)
      result = formatAttributes(group.lastEvent);
  };

  const onClick = (group: EventGroup) => {
    if (activeGroup?.id === group.id) {
      clearGroupInputResult();
    } else {
      setGroupInputResult(group);
    }
  };
</script>

<div class="rounded-sm border border-subtle bg-primary px-8">
  <BoxAnimation {groups} {onClick} />
  {#key activeGroup}
    <div class="flex items-start gap-2 pb-4">
      <div class="flex w-full flex-col gap-1 xl:w-1/2">
        {#each inputPayloads as [key, value] (key)}
          {@render payloads(key, value)}
        {/each}
      </div>
      <div class="flex w-full flex-col gap-1 xl:w-1/2">
        {#each resultPayloads as [key, value] (key)}
          {@render payloads(key, value)}
        {/each}
      </div>
    </div>
  {/key}
</div>

{#snippet payloads(key, value)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  <div>
    <p class="mb-1 min-w-56 text-sm text-secondary/80">
      {format(key)}
    </p>
    {#if value?.payloads}
      <PayloadDecoder {value} key="payloads">
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {:else if key === 'searchAttributes'}
      <PayloadDecoder
        key="searchAttributes"
        value={{ searchAttributes: codeBlockValue }}
      >
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {:else}
      <PayloadDecoder value={codeBlockValue}>
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue}
            maxHeight={384}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        {/snippet}
      </PayloadDecoder>
    {/if}
  </div>
  {#if stackTrace}
    <div>
      <p class="mb-1 min-w-56 text-sm text-secondary/80">
        {translate('workflows.call-stack-tab')}
      </p>
      <CodeBlock
        content={stackTrace}
        language="text"
        maxHeight={384}
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  {/if}
{/snippet}
