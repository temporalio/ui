<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import { autoRefreshWorkflow } from '$lib/stores/event-view';

  export let onChange: () => void;

  $: checked = $autoRefreshWorkflow === 'on';
</script>

<label
  for="autorefresh"
  class="mt-2 flex items-center gap-4 font-secondary text-sm"
  >Auto refresh
  <Tooltip bottomLeft text="15 second page refresh">
    <ToggleSwitch id="autorefresh" {checked} on:change={onChange} />
  </Tooltip>
</label>
