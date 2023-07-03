<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';

  export let Hst: HST;
  let checked = false;
</script>

<Hst.Story>
  <ToggleSwitch id="toggle-1" bind:checked />
</Hst.Story>
