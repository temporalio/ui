<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { autoRefreshWorkflow } from '$lib/stores/event-view';

  export let onChange: () => void;

  $: checked = $autoRefreshWorkflow === 'on';
</script>

<Tooltip
  bottomLeft
  text={translate('common.auto-refresh-tooltip', { interval: '15' })}
>
  <ToggleSwitch
    label={translate('common.auto-refresh')}
    labelPosition="left"
    id="autorefresh"
    {checked}
    onchange={onChange}
  />
</Tooltip>
