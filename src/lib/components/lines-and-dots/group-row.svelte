<script lang="ts">
  import { fade } from 'svelte/transition';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  // import type { WorkflowEvent } from '$lib/types/events';
  // import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getColor, getIcon } from '$lib/utilities/get-row-display';

  import EventPayload from './event-payload.svelte';

  export let group: EventGroup;
  export let level: number;

  // let duration = formatDistanceAbbreviated({
  //   start: group.initialEvent.eventTime,
  //   end: group.lastEvent.eventTime,
  //   includeMilliseconds: true,
  // });
  // let elapsedTime = formatDistanceAbbreviated({
  //   start: initialEvent.eventTime,
  //   end: group.initialEvent.eventTime,
  //   includeMilliseconds: true,
  // });
</script>

<div
  class="relative flex h-10 w-full items-center gap-2 px-4 py-1 text-white hover:bg-blurple"
  in:fade={{ duration: 500 }}
>
  <div
    class="grows grid grow grow grid-cols-1 items-center justify-between gap-4 md:grid-cols-3"
  >
    <div class="overflow-auto">
      <div class="flex shrink justify-between gap-2">
        <div class="flex w-[120px] items-center justify-end">
          <div
            class="-mr-2 h-4 w-4 rounded-full border-2 {getColor(
              group.lastEvent,
            )}"
          />
          <div class="flex h-full w-auto items-center gap-0">
            <div
              class="h-full {getColor(group.lastEvent)} opacity-20"
              style="width: {level * 8}px"
            />
            <div class="h-full w-[2px] {getColor(group.lastEvent)}" />
          </div>
        </div>
        <Icon
          name={getIcon(group.lastEvent)}
          class="scale-85 text-white text-white"
        />
        <div class="grow">{group.name}</div>
      </div>
    </div>
    <div class="overflow-auto">
      <EventPayload key="input" value={group.initialEvent.attributes?.input} />
    </div>
    <div class="shrink overflow-auto">
      <EventPayload
        key="result"
        value={group.initialEvent.attributes?.result}
      />
    </div>
  </div>
</div>
