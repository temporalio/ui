<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { Failure } from '$lib/types';
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

  import AgentAnimation from './agent-animation.svelte';

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
  let lastFailure: Failure | undefined = $state(undefined);

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
    lastFailure = undefined;
  };

  const setGroupInputResult = (group: EventGroup) => {
    activeGroup = group;

    if (group?.initialEvent) input = formatAttributes(group.initialEvent);
    if (group?.lastEvent && group.eventList.length > 1)
      result = formatAttributes(group.lastEvent);
    if (group?.pendingActivity && group.pendingActivity?.lastFailure)
      lastFailure = group.pendingActivity.lastFailure;
  };

  const onClick = (group: EventGroup) => {
    // clearGroupInputResult();
    if (group?.id !== activeGroup?.id) {
      setGroupInputResult(group);
    }
  };
</script>

<div class="rounded-sm border border-subtle bg-primary px-1.5">
  <AgentAnimation {groups} {onClick} />
  {#if activeGroup}
    {#key activeGroup}
      <div class="relative flex items-start gap-2 pb-4">
        <Button
          variant="ghost"
          size="xs"
          leadingIcon="close"
          class="absolute -top-3 right-2"
          on:click={() => clearGroupInputResult()}
        ></Button>
        <div class="flex w-full flex-col gap-1">
          {#each inputPayloads as [key, value] (key)}
            {@render payloads(key, value)}
          {/each}
        </div>
        {#if resultPayloads.length}
          <div class="flex w-full flex-col gap-1">
            {#each resultPayloads as [key, value] (key)}
              {@render payloads(key, value)}
            {/each}
          </div>
        {/if}
        {#if lastFailure}
          <div class="flex w-full flex-col gap-1">
            {@render payloads('lastFailure', lastFailure)}
          </div>
        {/if}
      </div>
    {/key}
  {/if}
</div>

{#snippet payloads(key, value)}
  {@const codeBlockValue = getCodeBlockValue(value)}
  {@const stackTrace = getStackTrace(codeBlockValue)}
  <div>
    <p class="font-bold text-secondary">
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
      <p class="font-bold text-secondary">
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
