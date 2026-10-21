<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import Badge from '$lib/io/badge/badge.svelte';
  import BadgeStatus from '$lib/io/badge-status/badge-status.svelte';
  import IconExternalLink from '$lib/io/icon/icons/external-link.svelte';

  import {
    relativeRunTime,
    sessionStatusPresentation,
  } from './session-presentation';
  import type { CatalogSession } from './session-store';
  import type { WorkbenchHost } from './workbench-host';

  interface Props {
    latest: CatalogSession | undefined;
    host: WorkbenchHost;
  }

  let { latest, host }: Props = $props();

  const run = $derived(latest ? sessionStatusPresentation(latest) : undefined);
  const evidence = $derived(
    latest?.outcome?.status === 'accepted'
      ? host.evidenceLink(latest.outcome)
      : undefined,
  );
</script>

{#if latest && run}
  <span class="inline-flex items-center gap-1">
    {#if 'status' in run}
      <BadgeStatus status={run.status} />
    {:else}
      <Badge text={run.label} />
    {/if}
    {#if evidence}
      <Link
        href={evidence.href}
        aria-label={evidence.label}
        class="inline-flex items-center no-underline!"
      >
        <IconExternalLink class="h-3.5 w-3.5" />
      </Link>
    {/if}
  </span>
  <span class="text-secondary"
    >{relativeRunTime(latest.createdAt, Date.now())}</span
  >
{:else}
  <span class="text-secondary">Not run</span>
{/if}
