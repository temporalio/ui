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
  <div class="flex items-center gap-1">
    <span
      class="surface-primary flex items-center rounded border border-subtle p-0.5"
    >
      <Icon name={config.icon} class="h-4 w-4" />
    </span>
    <span class="text-primary">{config.label}</span>
  </div>
{:else}
  <span class="text-secondary">—</span>
{/if}
