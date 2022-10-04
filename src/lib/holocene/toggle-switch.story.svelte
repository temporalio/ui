<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import type { Hst } from '@histoire/plugin-svelte';

  export let Hst: Hst;
  let checked = false;
</script>

<Hst.Story>
  <ToggleSwitch id="toggle-1" bind:checked />
</Hst.Story>
