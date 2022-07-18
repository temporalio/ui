<script lang="ts">
  import Chapter from '../_chapter.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  let checked = false;
</script>

<Chapter description="A Toggle Switch">
  <ToggleSwitch id="toggle-1" bind:checked />
  <p>checked: {checked}</p>
</Chapter>
