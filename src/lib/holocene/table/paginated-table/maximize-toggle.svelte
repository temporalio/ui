<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { MaximizeButton } from '$lib/holocene/maximizable';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    maximized: Writable<boolean>;
  }

  let { maximized }: Props = $props();
</script>

<Tooltip
  text={$maximized
    ? translate('common.minimize')
    : translate('common.maximize')}
  top
>
  <MaximizeButton
    maximized={$maximized}
    onclick={() => ($maximized = !$maximized)}
    class="m-0 h-8 px-2 py-1"
    data-testid="table-maximize-button"
  />
</Tooltip>
