<script>import Icon from '$holocene/icon/icon.svelte';
export let spec;
export let state;
export let policies;
let show = false;
</script>

<p on:click={() => (show = !show)} class="settings">
  Advanced Settings <Icon
    class="inline"
    name={show ? 'chevron-up' : 'chevron-down'}
  />
</p>
{#if show}
  <p>Schedule Start Time: {spec?.startTime ?? ''}</p>
  <p>Schedule End Time: {spec?.endTime ?? ''}</p>
  <p>Jitter: {spec?.jitter ?? ''}</p>
  <p>Exclusion Calendar: {spec?.excludeCalendar?.[0] ?? ''}</p>
  <p>Remaining Actions: {state?.remainingActions ?? ''}</p>
  <p>Overlap Policy: {policies?.overlapPolicy ?? ''}</p>
{/if}

<style>
  .settings {
    margin-bottom: 1rem;
    cursor: pointer;
    -webkit-text-decoration-line: underline;
            text-decoration-line: underline;
    -webkit-text-decoration-color: #18181b;
            text-decoration-color: #18181b
}</style>
