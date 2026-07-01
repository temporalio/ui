<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { ComputeStatus } from '$lib/types/deployments';
  import {
    connectionStateColor,
    connectionStateLabel,
    connectionTooltip,
    deriveConnectionStatus,
  } from '$lib/utilities/connection-status';

  interface Props {
    computeStatus?: ComputeStatus;
  }
  let { computeStatus }: Props = $props();

  const state = $derived(deriveConnectionStatus(computeStatus));
</script>

<Tooltip text={connectionTooltip(computeStatus)} topLeft width={250} usePortal>
  <p class="flex items-center justify-center gap-1 px-1 transition-colors">
    <span class={connectionStateColor[state]}
      >{connectionStateLabel(state)}</span
    >
  </p>
</Tooltip>
