<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { ComputeStatus } from '$lib/types/deployments';
  import {
    connectionStateColor,
    connectionStateLabel,
    connectionTooltip,
    deriveConnectionStatus,
  } from '$lib/utilities/connection-status';

  const CONFIG: Record<string, { icon: 'aws' | 'gcp'; label: string }> = {
    'aws-lambda': { icon: 'aws', label: 'Lambda' },
    'gcp-cloud-run': { icon: 'gcp', label: 'Cloud Run' },
  };

  let {
    type,
    computeStatus,
  }: { type: string | undefined; computeStatus?: ComputeStatus } = $props();

  const config = $derived(type ? CONFIG[type] : undefined);
  const state = $derived(
    computeStatus ? deriveConnectionStatus(computeStatus) : undefined,
  );
</script>

{#snippet pill()}
  <div
    class="inline-flex min-w-24 items-center justify-center gap-2 border border-subtle px-1"
  >
    {#if config}
      <Icon name={config.icon} />
      <p>{config.label}</p>
    {/if}
    {#if state}
      <span
        class="size-1.5 shrink-0 rounded-full bg-current {connectionStateColor[
          state
        ]}"
      ></span>
      <span class={connectionStateColor[state]}>
        {connectionStateLabel(state)}
      </span>
    {/if}
  </div>
{/snippet}

{#if config}
  {#if state}
    <Tooltip
      text={connectionTooltip(computeStatus)}
      topLeft
      width={250}
      usePortal
    >
      {@render pill()}
    </Tooltip>
  {:else}
    {@render pill()}
  {/if}
{/if}
