<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import IconButton from '$lib/components/icon-button.svelte';

  const settings = {
    startTime: '',
    endTime: '',
    jitter: '1 second',
    exclusionCalendar: '',
    remainingActions: '34',
    overlapPolicy: 'Option 1',
  };

  let show = false;
</script>

<p on:click={() => (show = !show)} class="settings">
  Advanced Settings <Icon
    class="inline"
    icon={show ? faCaretUp : faCaretDown}
  />
</p>
{#if show}
  <p>Schedule Start Time: {settings.startTime}</p>
  <p>Schedule End Time: {settings.endTime}</p>
  <p>Jitter: {settings.jitter}</p>
  <p>Exclusion Calendar: {settings.exclusionCalendar}</p>
  <p>Remaining Actions: {settings.remainingActions}</p>
  <p>Overlap Policy: {settings.overlapPolicy}</p>
{/if}

<style lang="postcss">
  .settings {
    @apply underline decoration-gray-900 mb-4 cursor-pointer;
  }
</style>
