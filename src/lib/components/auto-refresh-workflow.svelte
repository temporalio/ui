<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  import { autoRefreshWorkflow } from '$lib/stores/event-view';

  export let onChange: () => void;

  $: checked = $autoRefreshWorkflow === 'on';
</script>

<Tooltip bottomLeft text={translate('workflows', 'auto-refresh-tooltip')}>
  <ToggleSwitch
    label={translate('workflows', 'auto-refresh')}
    labelPosition="left"
    id="autorefresh"
    {checked}
    on:change={onChange}
  />
</Tooltip>
