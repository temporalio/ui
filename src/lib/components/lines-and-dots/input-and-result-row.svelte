<script lang="ts">
  import { fade } from 'svelte/transition';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventAttribute, WorkflowEvent } from '$lib/types/events';
  import type { PotentiallyDecodable } from '$lib/utilities/decode-payload';

  import EventPayload from './event-payload.svelte';

  export let title: 'Input' | 'Result';
  export let value: PotentiallyDecodable | EventAttribute | WorkflowEvent;
</script>

<div
  class="relative flex h-10 w-full items-center gap-2 px-4 py-1 text-white hover:bg-blurple"
  in:fade={{ duration: 500 }}
>
  <div class="flex items-center gap-4">
    <div class="overflow-auto">
      <div class="flex shrink justify-between gap-2">
        <div class="flex gap-0">
          <div class="w-10" />
        </div>
        <Icon name="json" class="scale-85 text-white text-white" />
        <div class="grow">{title}</div>
      </div>
    </div>
    <div class="grow overflow-auto">
      <EventPayload {value} />
    </div>
  </div>
</div>
