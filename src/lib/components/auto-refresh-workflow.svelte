<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  import { autoRefreshWorkflow } from '$lib/stores/event-view';

  export let onChange: () => void;

  $: checked = $autoRefreshWorkflow === 'on';
</script>

<label
  for="autorefresh"
  class="mt-2 flex items-center gap-4 font-secondary text-sm"
  >{translate('workflows', 'auto-refresh')}
  <Tooltip bottomLeft text={translate('workflows', 'auto-refresh-tooltip')}>
    <ToggleSwitch id="autorefresh" {checked} on:change={onChange} />
  </Tooltip>
</label>
