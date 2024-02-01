<script lang="ts">
  import { fade } from 'svelte/transition';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import { gap } from './event-graph.svelte';

  export let title: 'Input' | 'Result';
</script>

<div
  class="flex h-10 max-h-[{gap}px] h-[{gap}px] w-full grow items-center gap-2 px-4 py-0 text-white hover:bg-blurple"
  in:fade={{ duration: 500 }}
>
  <div class="flex items-center justify-between gap-4">
    <div class="flex justify-start gap-6">
      <Icon name="json" class="scale-85 text-white text-white" />
      <div class="grow">{title}</div>
    </div>
  </div>
</div>
