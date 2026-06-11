<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  const CONFIG: Record<string, { icon: 'aws' | 'gcp'; label: string }> = {
    'aws-lambda': { icon: 'aws', label: 'Lambda' },
    'gcp-cloud-run': { icon: 'gcp', label: 'Cloud Run' },
  };

  let { type }: { type: string | undefined } = $props();

  const config = $derived(type ? CONFIG[type] : undefined);
</script>

{#if config}
  <div
    class="border-subtle text-primary flex items-center gap-1 rounded-sm border px-1"
  >
    <Icon name={config.icon} class="h-4 w-4" />
    {config.label}
  </div>
{:else}
  <span class="text-secondary">—</span>
{/if}
