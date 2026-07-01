<script lang="ts">
  import type { Snippet } from 'svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';

  const CONFIG: Record<string, { icon: 'aws' | 'gcp'; label: string }> = {
    'aws-lambda': { icon: 'aws', label: 'Lambda' },
    'gcp-cloud-run': { icon: 'gcp', label: 'Cloud Run' },
  };

  let { type, children }: { type: string | undefined; children?: Snippet } =
    $props();

  const config = $derived(type ? CONFIG[type] : undefined);
</script>

{#if config}
  <div
    class="inline-flex min-w-24 items-center justify-center gap-2 border border-subtle px-1"
  >
    <Icon name={config.icon} />
    <p>{config.label}</p>
    {@render children?.()}
  </div>
{/if}
