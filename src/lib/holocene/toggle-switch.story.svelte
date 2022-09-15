<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  export let Hst;
  let checked = false;
</script>

<Hst.Story>
  <ToggleSwitch id="toggle-1" bind:checked />
</Hst.Story>
