<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { capitalize } from '$lib/utilities/format-camel-case';

  import PayloadDecoder from '../event/payload-decoder.svelte';

  export let group: EventGroup;

  let tab = 'input';
  $: value =
    tab === 'input'
      ? group.initialEvent.attributes?.input
      : tab === 'result'
      ? group.lastEvent.attributes?.result
      : group;
</script>

<div class="flex w-full overflow-auto text-white">
  <div class="flex w-1/2 flex-col gap-4 bg-blueGray-800 px-8 py-6">
    {#each group.eventList as event}
      <div class="flex gap-4">
        <p>{event.id}</p>
        <div class="flex w-full flex-col gap-2">
          <p class="font-bold">{event.eventType}</p>
          {#each Object.entries(event.attributes) as [key, value]}
            {#if typeof value !== 'object'}
              <div class="flex gap-4 border-b border-white p-1">
                <p class="w-1/2">{capitalize(key)}</p>
                <p class="w-1/2">{value}</p>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </div>
  <div class="flex w-1/2 flex-col gap-4 bg-blueGray-900 px-8 py-6">
    <div class="flex gap-4">
      <Icon name="json" />
      <button
        class="border-b-2 border-blueGray-900"
        on:click={() => (tab = 'input')}
        class:active={tab === 'input'}>Input</button
      >
      <button
        class="border-b-2 border-blueGray-900"
        on:click={() => (tab = 'result')}
        class:active={tab === 'result'}>Result</button
      >
      <button
        class="border-b-2 border-blueGray-900"
        on:click={() => (tab = 'json')}
        class:active={tab === 'json'}>JSON</button
      >
    </div>
    {#key value}
      <PayloadDecoder {value} key="payloads" let:decodedValue>
        <CodeBlock
          content={decodedValue}
          class="h-auto overflow-auto"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </PayloadDecoder>
    {/key}
  </div>
</div>

<style lang="postcss">
  .active {
    @apply border-b-2 border-white;
  }
</style>
