<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import WorkerStatusBadge from '$lib/components/workers/worker-status.svelte';
  import type { WorkerStatusCount } from '$lib/services/worker-service';

  interface Props {
    counts: WorkerStatusCount[];
    class?: ClassNameValue;
  }

  let { counts, class: className }: Props = $props();

  const visibleCounts = $derived(
    counts.filter(({ count }) => count !== undefined),
  );
</script>

<div class={merge('flex flex-wrap items-center gap-2', className)}>
  {#each visibleCounts as { status, count } (status)}
    <WorkerStatusBadge {status} {count} />
  {/each}
</div>
