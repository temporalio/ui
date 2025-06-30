<script lang="ts">
  import type { Readable } from 'svelte/store';

  import Badge from '$lib/holocene/badge.svelte';

  interface Props {
    tainted: Readable<Record<string, unknown>>;
    isTainted: (tainted: Record<string, unknown>) => boolean;
    class?: string;
  }

  let { tainted, isTainted, class: className = '' }: Props = $props();

  // Calculate tainted count based on the structure
  const taintedCount = $derived.by(() => {
    if (!isTainted($tainted)) return 0;

    // Handle nested object structure (like search attributes)
    if (
      $tainted &&
      typeof $tainted === 'object' &&
      Object.values($tainted).some((val) => typeof val === 'object')
    ) {
      return Object.values($tainted).filter((item) =>
        typeof item === 'object' && item !== null
          ? Object.values(item).some((value) => value === true)
          : item === true,
      ).length;
    }

    // Handle flat object structure (like codec server)
    return Object.values($tainted || {}).filter((value) => value === true)
      .length;
  });
</script>

{#if isTainted($tainted) && taintedCount > 0}
  <Badge
    class="absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px] {className}"
    type="count"
  >
    {taintedCount}
  </Badge>
{/if}
