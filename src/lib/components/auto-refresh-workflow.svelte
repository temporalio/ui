<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import { autoRefreshWorkflow } from '$lib/stores/event-view';

  export let onChange: () => void;

  $: checked = $autoRefreshWorkflow === 'on';
</script>

<label for="autorefresh" class="font-secondary text-sm">Auto refresh</label>
<Tooltip bottomLeft text="15 second page refresh">
  <ToggleSwitch id="autorefresh" {checked} on:change={onChange} />
</Tooltip>
