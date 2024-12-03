<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import RangeInput from '$lib/holocene/input/range-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fromEventToRawEvent } from '$lib/models/event-history';
  import { decodeEventHistory } from '$lib/stores/events';
  import type { WorkflowEvents } from '$lib/types/events';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let events: WorkflowEvents = [];

  let index = 1;

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

<svelte:window on:keydown={handleKeydown} />
<div class="flex gap-4 max-sm:flex-col">
  <div class="bg-gray-100 flex w-full gap-4">
    <RangeInput
      label={translate('common.event')}
      labelHidden
      id="range-input-event-history"
      min={1}
      max={events.length}
      bind:value={index}
    />
    <div class="flex items-center justify-center gap-3">
      <button
        class="caret"
        disabled={index === 1}
        on:click={() => {
          index -= 1;
        }}
        aria-label={translate('common.previous')}
      >
        <span class="arrow arrow-left" class:arrow-left-disabled={index === 1}
        ></span>
      </button>
      <button
        class="caret"
        disabled={index === events.length}
        on:click={() => {
          index += 1;
        }}
        aria-label={translate('common.next')}
      >
        <span
          class="arrow arrow-right"
          class:arrow-right-disabled={index === events.length}
        ></span>
      </button>
    </div>
  </div>
  <slot name="decode" />
</div>
<div class="py-4">
  {#if $decodeEventHistory}
    {#key [index, $decodeEventHistory]}
      <PayloadDecoder
        value={fromEventToRawEvent(events[index - 1])}
        let:decodedValue
      >
        <CodeBlock
          content={decodedValue}
          testId="event-history-json"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </PayloadDecoder>
    {/key}
  {:else}
    {#key index}
      <CodeBlock
        content={stringifyWithBigInt(
          fromEventToRawEvent(events[index - 1]),
          undefined,
          2,
        )}
        testId="event-history-json"
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    {/key}
  {/if}
</div>

<style lang="postcss">
  .caret {
    @apply relative;

    width: 12px;
    height: 12px;
  }

  .caret:disabled {
    @apply cursor-not-allowed text-slate-400;
  }

  .arrow {
    @apply absolute left-0 top-0 h-0 w-0;

    border-style: solid;
    border-width: 6px 12px 6px 0;
  }

  .arrow-left {
    border-width: 6px 12px 6px 0;
    border-color: transparent #18181b transparent transparent;
  }

  .arrow-left-disabled {
    border-color: transparent #d4d4d8 transparent transparent;
  }

  .arrow-right {
    border-width: 6px 0 6px 12px;
    border-color: transparent transparent transparent #18181b;
  }

  .arrow-right-disabled {
    border-color: transparent transparent transparent #d4d4d8;
  }
</style>
