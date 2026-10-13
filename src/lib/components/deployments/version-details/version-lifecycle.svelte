<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import { translate } from '$lib/i18n/translate';
  import type {
    DeploymentStatus,
    WorkerDeploymentVersionInfo,
  } from '$lib/types/deployments';
  import {
    type LifecycleRow,
    lifecycleRows,
  } from '$lib/utilities/version-details';

  interface Props {
    info: WorkerDeploymentVersionInfo;
    status: DeploymentStatus;
  }

  let { info, status }: Props = $props();

  const rows = $derived(lifecycleRows(info, status));
</script>

{#snippet value(row: LifecycleRow)}
  {#if row.text && row.time}
    {row.text}
    <span class="text-secondary">
      {translate('deployments.details-checked', {
        time: $timestamp(row.time, { relative: true }),
      })}
    </span>
  {:else if row.time}
    {$timestamp(row.time)}
    <span class="text-secondary">
      ({$timestamp(row.time, { relative: true })})
    </span>
  {:else}
    {row.text}
  {/if}
{/snippet}

<section
  aria-labelledby="version-details-lifecycle"
  class="flex flex-col gap-3"
>
  <h3 id="version-details-lifecycle" class="text-sm font-medium">
    {translate('deployments.lifecycle')}
  </h3>
  {#if rows.shown.length}
    <dl class="grid grid-cols-[10rem_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
      {#each rows.shown as row (row.key)}
        <dt class="text-secondary">{row.label}</dt>
        <dd class="tabular-nums">{@render value(row)}</dd>
      {/each}
    </dl>
  {/if}
  {#if rows.all.length}
    <details class="text-sm">
      <summary class="cursor-pointer text-secondary">
        {translate('deployments.details-all-timestamps')}
      </summary>
      <dl class="mt-2 grid grid-cols-[10rem_minmax(0,1fr)] gap-x-3 gap-y-1.5">
        {#each rows.all as row (row.key)}
          <dt class="text-secondary">{row.label}</dt>
          <dd class="tabular-nums">{$timestamp(row.time)}</dd>
        {/each}
      </dl>
    </details>
  {/if}
</section>
