<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { PendingActivity } from '$lib/types/events';

  import EventRowDetails from './event-row-details.svelte';
  import { historyGap } from './svg/history-graph.svelte';

  export let pendingActivity: PendingActivity;
  export let onClick: (pending: PendingActivity) => void;
  export let active = false;
</script>

<div
  class="flex h-10 cursor-pointer select-none max-h-[{historyGap}px] h-[{historyGap}px] pending w-full min-w-max grow items-center px-4 py-0 text-white hover:bg-indigo-400"
  in:fade={{ duration: 500 }}
  on:click={() => onClick(pendingActivity)}
  on:focus={() => onClick(pendingActivity)}
  on:keydown={() => onClick(pendingActivity)}
  class:active
>
  <div class="flex grow items-center justify-between gap-2">
    <div class="flex items-center gap-6">
      <p class="invisible">{pendingActivity.activityId}</p>
      <p>Pending Activity</p>
    </div>
    <EventRowDetails
      key="Attempt"
      value={pendingActivity.attempt}
      attributes={{}}
      inline
    />
  </div>
</div>

<style lang="postcss">
  .pending {
    background: repeating-linear-gradient(
      45deg,
      #606dbc,
      #606dbc 10px,
      #525d7b 10px,
      #525d7b 20px
    );
  }

  .active {
    background: repeating-linear-gradient(
      45deg,
      #444ce7,
      #444ce7 10px,
      #525d7b 10px,
      #525d7b 20px
    );
  }
</style>
