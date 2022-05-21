<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

  export let spec;
  export let state;
  export let policies;

  let show = false;
</script>

<p on:click={() => (show = !show)} class="settings">
  Advanced Settings <Icon
    class="inline"
    icon={show ? faCaretUp : faCaretDown}
  />
</p>
{#if show}
  <p>Schedule Start Time: {spec?.startTime ?? ''}</p>
  <p>Schedule End Time: {spec?.endTime ?? ''}</p>
  <p>Jitter: {spec?.jitter ?? ''}</p>
  <p>Exclusion Calendar: {spec?.exclusionCalendar ?? ''}</p>
  <p>Remaining Actions: {state?.remainingActions ?? ''}</p>
  <p>Overlap Policy: {policies?.overlapPolicy ?? ''}</p>
{/if}

<style lang="postcss">
  .settings {
    @apply underline decoration-gray-900 mb-4 cursor-pointer;
  }
</style>
