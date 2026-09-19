<script lang="ts">
  import {
    COMPUTE_PROVIDERS,
    computeProviderFromType,
  } from '$lib/components/workers/serverless-worker-form/compute-providers';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { ComputeStatus } from '$lib/types/deployments';
  import {
    connectionStateColor,
    connectionStateLabel,
    connectionTooltip,
    deriveConnectionStatus,
  } from '$lib/utilities/connection-status';

  let {
    type,
    computeStatus,
  }: { type: string | undefined; computeStatus?: ComputeStatus } = $props();

  const provider = $derived(computeProviderFromType(type));
  const config = $derived(provider ? COMPUTE_PROVIDERS[provider] : undefined);
  const state = $derived(
    computeStatus ? deriveConnectionStatus(computeStatus) : undefined,
  );
</script>

{#snippet pill()}
  <div
    class="inline-flex min-w-24 items-center justify-center gap-2 border border-primary px-1"
  >
    {#if config}
      {@const ProviderIcon = config.icon}
      <ProviderIcon />
      <p>{config.badgeLabel}</p>
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
