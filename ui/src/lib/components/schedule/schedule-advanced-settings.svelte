<script lang="ts">
  import type { ScheduleSpec, ScheduleState, SchedulePolicies } from '$types';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let spec: ScheduleSpec;
  export let state: ScheduleState;
  export let policies: SchedulePolicies;

  let show = false;
</script>

<button on:click={() => (show = !show)} class="settings">
  Advanced Settings <Icon
    class="inline"
    name={show ? 'chevron-up' : 'chevron-down'}
  />
</button>
{#if show}
  <p>Schedule Start Time: {spec?.startTime ?? ''}</p>
  <p>Schedule End Time: {spec?.endTime ?? ''}</p>
  <p>Jitter: {spec?.jitter ?? ''}</p>
  <p>Exclusion Calendar: {spec?.excludeCalendar?.[0] ?? ''}</p>
  <p>Remaining Actions: {state?.remainingActions ?? ''}</p>
  <p>Overlap Policy: {policies?.overlapPolicy ?? ''}</p>
{/if}

<style lang="postcss">
  .settings {
    @apply mb-4 underline decoration-gray-900;
  }
</style>
