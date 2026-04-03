<script lang="ts">
  const LABELS: Record<string, string> = {
    'aws-lambda': 'Lambda',
    'gcp-cloud-run': 'Cloud Run',
    vercel: 'Vercel',
  };

  let { type }: { type: string | undefined } = $props();

  const label = $derived(type ? (LABELS[type] ?? type) : undefined);
</script>

{#if label}
  <div
    class="inline-flex items-center border border-subtle px-1.5 py-0.5 text-xs text-secondary"
  >
    {label}
  </div>
{:else}
  <span class="text-secondary">—</span>
{/if}
