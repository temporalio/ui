<script lang="ts">
  import type { Snippet } from 'svelte';

  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import RangeInput from '$lib/holocene/input/range-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fromEventToRawEvent } from '$lib/models/event-history';
  import { decodeEventHistory } from '$lib/stores/events';
  import type { WorkflowEvents } from '$lib/types/events';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  interface Props {
    events?: WorkflowEvents;
    decode?: Snippet;
  }

  let { events = [], decode }: Props = $props();

  let index = $state(1);
  let rawEvent = $derived(
    events[index - 1] ? fromEventToRawEvent(events[index - 1]) : {},
  );

  function handleKeydown(event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowRight':
      case 'KeyL':
        event.preventDefault();
        event.stopPropagation();
        if (index < events.length) {
          index += 1;
        }
        break;
      case 'ArrowLeft':
      case 'KeyH':
        event.preventDefault();
        event.stopPropagation();
        if (index > 1) {
          index -= 1;
        }
        break;
      default:
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
<div class="flex gap-3 max-sm:flex-col">
  <div
    class="surface-primary flex w-full min-w-0 items-center gap-3 rounded-panel border border-subtle p-2"
  >
    <RangeInput
      label={translate('common.event')}
      labelHidden
      id="range-input-event-history"
      min={1}
      max={events.length}
      bind:value={index}
    />
    <div class="flex shrink-0 items-center justify-center gap-1">
      <IconButton
        icon="chevron-left"
        label={translate('common.previous')}
        size="xs"
        disabled={index === 1}
        onclick={() => {
          index -= 1;
        }}
      />
      <IconButton
        icon="chevron-right"
        label={translate('common.next')}
        size="xs"
        disabled={index === events.length}
        onclick={() => {
          index += 1;
        }}
      />
    </div>
  </div>
  {@render decode?.()}
</div>
<div class="min-h-dvh py-4">
  {#if $decodeEventHistory && events.length > 0}
    <PayloadCodeBlock
      value={rawEvent}
      label={translate('common.json')}
      testId="event-history-json"
    />
  {:else}
    {#key index}
      <CodeBlock
        content={stringifyWithBigInt(rawEvent, undefined, 2)}
        label={translate('common.json')}
        testId="event-history-json"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    {/key}
  {/if}
</div>
