<script lang="ts">
  import { fade } from 'svelte/transition';

  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { capitalize } from '$lib/utilities/format-camel-case';

  import { getPayloads, parseContent } from './input-and-result-payloads';

  import { gap } from './history-graph.svelte';

  export let type: 'input' | 'result';
  export let content: string;
  export let onClick: (type: 'input' | 'result') => void;
  export let active = false;

  $: parsedContent = parseContent(content);
  $: payloads = getPayloads(parsedContent);
</script>

<div
  class="flex h-10 cursor-pointer select-none max-h-[{gap}px] h-[{gap}px] w-full grow items-center gap-2 px-4 py-0 text-white hover:bg-blurple"
  in:fade={{ duration: 500 }}
  on:click={() => onClick(type)}
  on:focus={() => onClick(type)}
  on:keydown={() => onClick(type)}
  class:active
>
  <div class="flex items-center justify-between gap-4">
    <div class="flex justify-start gap-6">
      <Icon name="json" class="scale-85 text-white text-white" />
      <div class="grow">{capitalize(type)}</div>
      <Badge type="count" class="rounded-sm">{payloads.length}</Badge>
    </div>
  </div>
</div>

<style lang="postcss">
  .active {
    @apply bg-blurple;
  }
</style>
